import "./mixins/_types";
import type { documentTypes } from "../constants/document-types.mjs";

declare global {
  namespace Teriock.Documents {
    export type ActorType = keyof typeof documentTypes.actors;

    export type ItemType = keyof typeof documentTypes.items;

    export type EffectType = keyof typeof documentTypes.effects;

    export type MacroType = keyof typeof documentTypes.macros;

    export type ModelMetadata = {
      type: string;
      childEffectTypes: Teriock.Documents.EffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      childMacroTypes: Teriock.Documents.MacroType[];
    };

    export type ChildModelMetadata = Teriock.Documents.ModelMetadata & {
      usable: boolean;
      consumable: boolean;
      wiki: boolean;
      namespace: string;
      pageNameKey: string;
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
    };
  }
}
