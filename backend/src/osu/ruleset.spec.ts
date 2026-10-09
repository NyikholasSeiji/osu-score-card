import { BadRequestException } from '@nestjs/common';
import { Ruleset } from 'osu-api-v2-js';
import { parseRuleset, rulesetName } from './ruleset.js';

describe('parseRuleset', () => {
  it('defaults to osu! standard', () => {
    expect(parseRuleset(undefined)).toBe(Ruleset.osu);
    expect(parseRuleset('')).toBe(Ruleset.osu);
  });

  it('accepts every API ruleset name', () => {
    expect(parseRuleset('taiko')).toBe(Ruleset.taiko);
    expect(parseRuleset('fruits')).toBe(Ruleset.fruits);
    expect(parseRuleset('mania')).toBe(Ruleset.mania);
  });

  it('rejects anything else', () => {
    expect(() => parseRuleset('catch')).toThrow(BadRequestException);
  });
});

describe('rulesetName', () => {
  it('round-trips with the enum', () => {
    expect(rulesetName(Ruleset.fruits)).toBe('fruits');
    expect(parseRuleset(rulesetName(Ruleset.mania))).toBe(Ruleset.mania);
  });
});
