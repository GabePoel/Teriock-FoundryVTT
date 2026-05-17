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
import "./roll-table/_types";
import "./scene/_types";
import "./table-result/_types";
import "./token-document/_types";
import "./user/_types";

import { documentConfig } from "../constants/config/document-config.mjs";

declare global {
  namespace Teriock.Documents {
    type DocumentConfig = typeof documentConfig;

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

    type ExtractKeysByDocName<T extends string> = {
      [K in keyof DocumentConfig]: DocumentConfig[K] extends { documentName: T } ? K : never;
    }[keyof DocumentConfig];

    export type ActorType = ExtractKeysByDocName<"Actor">;
    export type ItemType = ExtractKeysByDocName<"Item">;
    export type ActiveEffectType = ExtractKeysByDocName<"ActiveEffect">;
    export type CardType = ExtractKeysByDocName<"Card">;
    export type ChildType = Teriock.Documents.ItemType | Teriock.Documents.ActiveEffectType;
    export type CommonType = Teriock.Documents.ChildType | Teriock.Documents.ActorType | "base";

    export type ModelMetadata = {
      armament: boolean;
      childEffectTypes: Teriock.Documents.ActiveEffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      consumable: boolean;
      hierarchy: boolean;
      indexCategoryKey?: IndexCategoryKey;
      indexCompendiumKey?: IndexCompendiumKey;
      modifies: ParentDocumentName;
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
