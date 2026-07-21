import documentConfig from "../constants/config/document-config.mjs";
import { TypeCollection } from "./collections/_module.mjs";

declare global {
  namespace Teriock.Documents {
    type DocumentConfig = typeof documentConfig;

    type ExtractKeysByDocName<T extends string> = {
      [K in keyof DocumentConfig]: DocumentConfig[K] extends { documentName: T } ? K : never;
    }[keyof DocumentConfig];

    export type ActorType = ExtractKeysByDocName<"Actor">;
    export type ItemType = ExtractKeysByDocName<"Item">;
    export type ActiveEffectType = ExtractKeysByDocName<"ActiveEffect">;
    export type CardType = ExtractKeysByDocName<"Card">;
    export type ChildType = Teriock.Documents.ActiveEffectType | Teriock.Documents.ItemType;
    export type CommonType = "base" | Teriock.Documents.ActorType | Teriock.Documents.ChildType;

    export type DocumentBase<Class, Parent extends object = object> = Class & Parent;

    /**
     * Store of lazily-computed values cached on a document.
     */
    export type DocumentCache = {
      /** All sups ancestral to this document or their indexes. */
      allSups?: TypeCollection<ID<TeriockDocument>, TeriockDocument>;
      /** All children of this document or their indexes. */
      childArray?: AnyChildDocument[];
      /** All children of this document or their indexes, keyed by id. */
      children?: TypeCollection<ID<AnyChildDocument>, AnyChildDocument>;
      /** Previously-tracked dependency id, retained so it can be untracked when it changes. */
      dep?: string;
      /** Previously-tracked typed identifier, retained so it can be untracked when it changes. */
      identifier?: TypedIdentifier;
      /** Whether this document is a reference and not "real". */
      isReference?: boolean;
      /** Whether this document is a status effect. */
      isStatus?: boolean;
      /** All modifiable children of this document, visible or otherwise. */
      modifiableChildren?: AnyActiveEffect[];
      /** The subs of this document or their indexes. */
      subs?: TypeCollection<ID<TeriockDocument>, TeriockDocument>;
      /** Previously-tracked sup id, retained so a moved sub can reset its old sup. */
      supId?: ID<AnyCommonDocument> | null;
      /** All valid active effects that apply to this document. */
      validEffects?: AnyActiveEffect[];
      /** All visible children of this document or their indexes. */
      visibleChildren?: AnyChildDocument[];
      /** All visible children of this document or their indexes, keyed by type. */
      visibleChildrenByType?: Record<Teriock.Documents.ChildType, AnyChildDocument[]>;
    };

    export type Subtype<Base, Type extends string, Sheet, System> =
      & Omit<Base, "_id" | "id" | "sheet" | "system" | "type" | "uuid">
      & {
        _id: ID<Subtype<Base, Type, Sheet, System>>;
        sheet: Sheet;
        system: System;
        type: Type;
        get id(): ID<Subtype<Base, Type, Sheet, System>>;
        get uuid(): UUID<Subtype<Base, Type, Sheet, System>>;
      };

    export type ModelMetadata = {
      armament: boolean;
      childEffectTypes: Teriock.Documents.ActiveEffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      consumable: boolean;
      hierarchy: boolean;
      isTextPage?: boolean;
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
      dependee: boolean;
      hierarchy: boolean;
      model?: ModelMetadata;
      parent: boolean;
      tooltip: boolean;
    };
  }
}
