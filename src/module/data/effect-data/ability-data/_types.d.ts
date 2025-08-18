import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockAbilityConsequenceSchema } from "./types/consequences";
import type { TeriockAbilityRulesSchema } from "./types/rules";
import type { TeriockAbility } from "../../../documents/_documents.mjs";
import type { ConsumableInterface } from "../shared/shared-fields";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData
    extends TeriockAbilityRulesSchema,
      TeriockAbilityConsequenceSchema,
      TeriockBaseEffectData,
      ConsumableInterface {
    get parent(): TeriockAbility;
  }
}
