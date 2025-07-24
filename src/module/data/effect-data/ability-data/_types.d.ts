import "src/module/data/consequence-data/ability-data/types/roll-config";
import { TeriockAbility } from "../../../documents/_documents.mjs";
import { TeriockAbilityConsequenceSchema } from "./types/consequences";
import { TeriockAbilityHierarchySchema } from "./types/hierarchy";
import { TeriockAbilityRulesSchema } from "./types/rules";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockBaseEffectSchema } from "../base-effect-data/_types";

export interface TeriockAbilitySchema
  extends TeriockAbilityRulesSchema,
    TeriockAbilityHierarchySchema,
    TeriockAbilityConsequenceSchema,
    TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Ability";
  /** Parent */
  parent: TeriockAbility;
}

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData extends TeriockAbilitySchema, TeriockBaseEffectData {}
}