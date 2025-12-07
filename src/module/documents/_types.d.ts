import { documentTypes } from "../constants/system/document-types.mjs";
import * as models from "../data/_module.mjs";
import TeriockBaseEffectModel from "../data/effect-data/base-effect-model/base-effect-model.mjs";
import TeriockBaseItemModel from "../data/item-data/base-item-model/base-item-model.mjs";
import TeriockBaseActorModel from "../data/actor-data/base-actor-model/base-actor-model.mjs";

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
        ids: ID<Embed>[],
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
      armament: boolean;
      childActorTypes: Teriock.Documents.ActorType[];
      childEffectTypes: Teriock.Documents.EffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      childMacroTypes: Teriock.Documents.MacroType[];
      consumable: boolean;
      hierarchy: boolean;
      indexCategoryKey?: IndexCategoryKey;
      indexCompendiumKey?: IndexCompendiumKey;
      modifies: TeriockParentName;
      namespace: string;
      pageNameKey: string;
      passive: boolean;
      preservedProperties: string[];
      revealable: boolean;
      type: Teriock.Documents.CommonType;
      usable: boolean;
      visibleTypes: Teriock.Documents.CommonType[];
      wiki: boolean;
    };

    export type ActorModel = TeriockBaseActorModel &
      InstanceType<(typeof models.actor)[keyof typeof models.actor]>;
    export type ItemModel = TeriockBaseItemModel &
      InstanceType<(typeof models.item)[keyof typeof models.item]>;
    export type EffectModel = TeriockBaseEffectModel &
      InstanceType<(typeof models.effect)[keyof typeof models.effect]>;
  }
}

declare module "./chat-message/chat-message.mjs" {
  export default interface TeriockChatMessage {
    get implementation(): typeof TeriockChatMessage;
  }
}
