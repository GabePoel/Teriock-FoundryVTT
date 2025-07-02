import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import type { WikiDataMixin } from "../mixins/wiki-mixin.mjs";
import { TeriockAbility } from "../../../types/documents";
import { TeriockAbilityRulesSchema } from "./types/rules";
import { TeriockAbilityHierarchySchema } from "./types/hierarchy";
import { TeriockAbilityConsequenceSchema } from "./types/consequences";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData extends
    TeriockAbilityRulesSchema,
    TeriockAbilityHierarchySchema,
    TeriockAbilityConsequenceSchema,
    WikiDataMixin,
    TeriockBaseEffectData {
    parent: TeriockAbility;
    wikiNamespace: "Ability";
  }
}
