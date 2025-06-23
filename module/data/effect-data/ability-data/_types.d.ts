import { TeriockAbilitySchemaData } from "./methods/schema/_types";
import type { WikiDataMixin } from "../mixins/wiki-mixin.mjs";
import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockEffect } from "@client/documents/_module.mjs";
import { TeriockDerivedAbilityData } from "./methods/data-deriving/_types";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData
    extends TeriockDerivedAbilityData,
      TeriockAbilitySchemaData,
      WikiDataMixin,
      TeriockBaseEffectData {
    wikiNamespace: "Ability";
    parent: TeriockEffect;
  }
}
