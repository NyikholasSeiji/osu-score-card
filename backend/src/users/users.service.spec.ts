import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { API, APIError, Ruleset } from 'osu-api-v2-js';
import { OsuClient } from '../osu/osu-client.js';
import { UsersService } from './users.service.js';

const mrekk = {
  id: 7562902,
  username: 'mrekk',
  country_code: 'AU',
  avatar_url: 'https://a.ppy.sh/7562902',
};

function notFound(): APIError {
  return new APIError(
    'nope',
    'https://osu.ppy.sh/api/v2',
    'get',
    'users',
    {},
    {
      status_code: 404,
      json: {},
    },
  );
}

function service(api: Partial<API>): UsersService {
  const osu = new OsuClient();
  vi.spyOn(osu, 'get').mockReturnValue(api as API);
  return new UsersService(osu);
}

describe('UsersService.search', () => {
  it('maps search results to players and caps the list', async () => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      ...mrekk,
      id: i + 1,
    }));
    const users = service({
      searchUser: vi.fn().mockResolvedValue({ data, total: 12 }),
    });
    const players = await users.search('mrekk');
    expect(players).toHaveLength(8);
    expect(players[0]).toEqual({
      id: 1,
      username: 'mrekk',
      countryCode: 'AU',
      avatarUrl: 'https://a.ppy.sh/7562902',
    });
  });

  it('falls back to an exact username lookup when search fails', async () => {
    const getUser = vi.fn().mockResolvedValue(mrekk);
    const users = service({
      searchUser: vi.fn().mockRejectedValue(new Error('boom')),
      getUser,
    });
    expect(await users.search('mrekk')).toEqual([
      expect.objectContaining({ id: 7562902 }),
    ]);
    expect(getUser).toHaveBeenCalledWith('mrekk', Ruleset.osu);
  });

  it('returns an empty list when the fallback finds nobody', async () => {
    const users = service({
      searchUser: vi.fn().mockRejectedValue(new Error('boom')),
      getUser: vi.fn().mockRejectedValue(notFound()),
    });
    expect(await users.search('nobody')).toEqual([]);
  });
});

describe('UsersService.getScores', () => {
  it('requests the given ruleset, lazer included and fails excluded', async () => {
    const getUserScores = vi.fn().mockResolvedValue([]);
    const users = service({ getUserScores });
    expect(await users.getScores(7562902, 'best', Ruleset.mania)).toEqual([]);
    expect(getUserScores).toHaveBeenCalledWith(
      7562902,
      'best',
      Ruleset.mania,
      { lazer: true, fails: false },
      { limit: 50 },
    );
  });

  it('maps API errors to HTTP exceptions', async () => {
    await expect(
      service({
        getUserScores: vi.fn().mockRejectedValue(notFound()),
      }).getScores(1, 'recent', Ruleset.osu),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service({
        getUserScores: vi.fn().mockRejectedValue(new Error('down')),
      }).getScores(1, 'recent', Ruleset.osu),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
