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
    export type CardType = keyof typeof documentTypes.card;

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
      pseudos: Record<string, string>;
      revealable: boolean;
      stats: boolean;
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
  }
}
