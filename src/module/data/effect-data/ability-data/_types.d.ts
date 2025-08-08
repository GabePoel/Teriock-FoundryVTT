import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockAbilityConsequenceSchema } from "./types/consequences";
import { TeriockAbilityRulesSchema } from "./types/rules";
import { TeriockAbility } from "../../../documents/_documents.mjs";
import { ConsumableInterface } from "../shared/shared-fields";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData
    extends TeriockAbilityRulesSchema,
      TeriockAbilityConsequenceSchema,
      TeriockBaseEffectData,
      ConsumableInterface {
    /** Parent */
    parent: TeriockAbility;
  }
}
