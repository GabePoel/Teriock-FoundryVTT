import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockAbilityConsequenceSchema } from "./types/consequences";
import type { TeriockAbilityRulesSchema } from "./types/rules";
import type { TeriockAbility } from "../../../documents/_documents.mjs";
import type { ConsumableInterface } from "../shared/shared-fields";
import type { HierarchyDataMixinInterface } from "../../mixins/hierarchy-data-mixin/_types";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityModel extends TeriockAbilityRulesSchema,
    TeriockAbilityConsequenceSchema,
    TeriockBaseEffectModel,
    ConsumableInterface,
    HierarchyDataMixinInterface {
    get parent(): TeriockAbility;
  }
}
