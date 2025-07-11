import "types/roll-config";
import { TeriockAbilityRulesSchema } from "./types/rules";
import { TeriockAbilityHierarchySchema } from "./types/hierarchy";
import { TeriockAbilityConsequenceSchema } from "./types/consequences";
import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";
import { TeriockBaseEffectSchema } from "../base-effect-data/_types";

export interface TeriockAbilitySchema
  extends TeriockAbilityRulesSchema,
    TeriockAbilityHierarchySchema,
    TeriockAbilityConsequenceSchema,
    TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Ability";
}

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData extends TeriockAbilitySchema, TeriockBaseEffectData {}
}
