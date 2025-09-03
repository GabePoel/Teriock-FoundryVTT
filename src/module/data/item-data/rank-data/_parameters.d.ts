import type { rankOptions } from "../../../constants/options/rank-options.mjs";
import type { abilityOptions } from "../../../constants/options/ability-options.mjs";

declare global {
  namespace Teriock.Parameters.Rank {
    /** Archetype */
    export type RankArchetype = keyof typeof rankOptions;

    /** Class */
    export type RankClass = keyof typeof abilityOptions.class;
  }
}
