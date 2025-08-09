import "./mixins/_types";

declare global {
  namespace Teriock.Documents {
    export type ActorType = "base" | "character";

    export type ItemType = "base" | "equipment" | "rank" | "power" | "mechanic";

    export type EffectType =
      | "ability"
      | "attunement"
      | "base"
      | "condition"
      | "consequence"
      | "fluency"
      | "property"
      | "resource";

    export type ModelMetadata = {
      type: string;
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
      type: Teriock.Documents.ItemType;
    };

    export type EffectModelMetadata = Teriock.Documents.ChildModelMetadata & {
      type: Teriock.Documents.EffectType;
      hierarchy: boolean;
    };
  }
}
