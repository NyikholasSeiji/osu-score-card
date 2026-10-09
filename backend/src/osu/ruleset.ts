import { BadRequestException } from '@nestjs/common';
import { Ruleset } from 'osu-api-v2-js';

/** Game modes as named in the osu! API (`fruits` is osu!catch). */
export type RulesetName = 'osu' | 'taiko' | 'fruits' | 'mania';

export const RULESET_NAMES: readonly RulesetName[] = [
  'osu',
  'taiko',
  'fruits',
  'mania',
];

export function isRulesetName(value: string): value is RulesetName {
  return (RULESET_NAMES as readonly string[]).includes(value);
}

export function rulesetName(ruleset: Ruleset): RulesetName {
  return RULESET_NAMES[ruleset];
}

/** Reads the `mode` query parameter; defaults to osu! standard. */
export function parseRuleset(mode: string | undefined): Ruleset {
  if (mode === undefined || mode === '') return Ruleset.osu;
  if (!isRulesetName(mode)) {
    throw new BadRequestException({
      code: 'INVALID_RULESET',
      message: `mode must be one of ${RULESET_NAMES.join(', ')}.`,
    });
  }
  return Ruleset[mode];
}
