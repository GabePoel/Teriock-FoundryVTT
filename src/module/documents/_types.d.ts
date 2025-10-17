import "./mixins/_types";
import type { documentTypes } from "../constants/system/document-types.mjs";

declare global {
  namespace Teriock.Documents {
    export type IndexCategoryKey = keyof typeof TERIOCK.index;

    export type IndexCompendiumKey =
      | "abilities"
      | "classes"
      | "creatures"
      | "equipment"
      | "bodyParts"
      | "magicItems"
      | "powers"
      | "properties"
      | "species";

    export type ActorType = keyof typeof documentTypes.actors;
    export type ItemType = keyof typeof documentTypes.items;
    export type EffectType = keyof typeof documentTypes.effects;
    export type MacroType = keyof typeof documentTypes.macros;
    export type ChildType =
      | Teriock.Documents.ItemType
      | Teriock.Documents.EffectType;
    export type CommonType =
      | Teriock.Documents.ChildType
      | Teriock.Documents.ActorType;

    export type ModelMetadata = {
      childEffectTypes: Teriock.Documents.EffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      childMacroTypes: Teriock.Documents.MacroType[];
      collection: string;
      indexCategoryKey?: Teriock.Documents.IndexCategoryKey;
      indexCompendiumKey?: Teriock.Documents.IndexCompendiumKey;
      preservedProperties: string[];
      type: Teriock.Documents.CommonType;
    };

    export type ChildModelMetadata = Teriock.Documents.ModelMetadata & {
      consumable: boolean;
      namespace: string;
      pageNameKey: string;
      passive: boolean;
      type: Teriock.Documents.ChildType;
      usable: boolean;
      wiki: boolean;
    };

    export type ActorModelMetadata = Teriock.Documents.ModelMetadata & {
      type: Teriock.Documents.ActorType;
    };

    export type ItemModelMetadata = Teriock.Documents.ChildModelMetadata & {
      stats: boolean;
      type: Teriock.Documents.ItemType;
    };

    export type EffectModelMetadata = Teriock.Documents.ChildModelMetadata & {
      type: Teriock.Documents.EffectType;
      hierarchy: boolean;
      modifies: "Actor" | "Item";
    };
  }
}
