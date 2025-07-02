import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import type { WikiDataMixin } from "../mixins/wiki-mixin.mjs";
import { TeriockAbilitySchemaData } from "./methods/schema/_types";
import { TeriockDerivedAbilityData } from "./methods/data-deriving/_types";
import { TeriockAbility } from "../../../types/documents";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData
    extends TeriockDerivedAbilityData,
      TeriockAbilitySchemaData,
      WikiDataMixin,
      TeriockBaseEffectData {
    parent: TeriockAbility;
    wikiNamespace: "Ability";
  }
}
