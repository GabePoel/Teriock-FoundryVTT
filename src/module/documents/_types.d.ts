import "./mixins/_types";
import type { documentTypes } from "../constants/system/document-types.mjs";
import type * as models from "../data/_module.mjs";

declare global {
  namespace Teriock.Documents {
    type NullDocument = {
      readonly documentName: "";
    };

    interface Interface<
      Embed extends {
        documentName?: string;
      },
    > {
      isOwner: boolean;
      limited: boolean;
      name: string;

      createEmbeddedDocuments(
        embeddedName: Embed["documentName"],
        data: object[],
        operation: object,
      ): Promise<Embed[]>;

      deleteEmbeddedDocuments(
        embeddedName: Embed["documentName"],
        ids: Teriock.ID<Embed>[],
        operation: object,
      ): Promise<Embed[]>;

      prepareEmbeddedDocuments(): void;

      updateEmbeddedDocuments(
        embeddedName: Embed["documentName"],
        updates: object[],
        operation: object,
      ): Promise<Embed[]>;
    }

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
      hierarchy: boolean;
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
      modifies: TeriockParent;
    };

    export type ActorModel = (typeof models.actor)[keyof typeof models.actor];
    export type ItemModel = (typeof models.item)[keyof typeof models.item];
    export type EffectModel =
      (typeof models.effect)[keyof typeof models.effect];
  }
}

declare module "./chat-message/chat-message.mjs" {
  export default interface TeriockChatMessage {
    get implementation(): typeof TeriockChatMessage;
  }
}
