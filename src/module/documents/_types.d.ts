import "./active-effect/_types";
import "./actor/_types";
import "./card/_types";
import "./chat-message/_types";
import "./combat/_types";
import "./combatant/_types";
import "./folder/_types";
import "./item/_types";
import "./journal-entry-category/_types";
import "./journal-entry-page/_types";
import "./journal-entry/_types";
import "./macro/_types";
import "./mixins/_types";
import "./roll-table/_types";
import "./scene/_types";
import "./table-result/_types";
import "./token-document/_types";
import "./user/_types";
import { documentTypes } from "../constants/system/document-types.mjs";
import * as systems from "../data/systems/_module.mjs";

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
      namespace?: string;
      pageNameKey: string;
      passive: boolean;
      preservedProperties: string[];
      revealable: boolean;
      tooltip: boolean;
      type: Teriock.Documents.CommonType;
      usable: boolean;
      visibleTypes: Teriock.Documents.CommonType[];
      wiki: boolean;
    };

    export type DocumentMetadata = {
      child: boolean;
      common: boolean;
      hierarchy: boolean;
      model?: ModelMetadata;
      parent: boolean;
      tooltip: boolean;
      typed: boolean;
      types: Teriock.Documents.CommonType[];
    };

    export type ActorModel = systems.actors.BaseActorSystem &
      InstanceType<(typeof systems.actors)[keyof typeof systems.actors]>;
    export type ItemModel = systems.items.BaseItemSystem &
      InstanceType<(typeof systems.items)[keyof typeof systems.items]>;
    export type EffectModel = systems.effects.BaseEffectSystem &
      InstanceType<(typeof systems.effects)[keyof typeof systems.effects]>;
  }
}

declare module "./chat-message/chat-message.mjs" {
  export default interface TeriockChatMessage {
    get implementation(): typeof TeriockChatMessage;
  }
}
