import { TypeCollection } from "./collections/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export type ChildType = ActiveEffectType | ItemType;
    export type CommonType = ActorType | Teriock.Documents.ChildType;

    export type DocumentBase<Class, Parent extends object = object> = Class & Parent;

    export type PseudoCollections = {
      Activation?: TypeCollection<ID<Activation>, Activation>;
      Affinity?: TypeCollection<ID<Affinity>, Affinity>;
      Automation?: TypeCollection<ID<Automation>, Automation>;
      Expiration?: TypeCollection<ID<Expiration>, Expiration>;
    };

    /**
     * Store of lazily-computed values cached on a document.
     */
    export type DocumentCache = {
      /** All sups ancestral to this document or their indexes. */
      allSups?: TypeCollection<ID<TeriockDocument>, TeriockDocument>;
      /** All children of this document or their indexes. */
      childArray?: (TeriockActiveEffect | TeriockItem)[];
      /** All children of this document or their indexes, keyed by id. */
      children?: TypeCollection<ID<TeriockActiveEffect | TeriockItem>, TeriockActiveEffect | TeriockItem>;
      /** Previously-tracked dependency id, retained so it can be untracked when it changes. */
      dep?: string;
      /** Previously-tracked typed identifier, retained so it can be untracked when it changes. */
      identifier?: TypedIdentifier;
      /** Whether this document is a reference and not "real". */
      isReference?: boolean;
      /** Whether this document is a status effect. */
      isStatus?: boolean;
      /** All modifiable children of this document, visible or otherwise. */
      modifiableChildren?: TeriockActiveEffect[];
      /** The subs of this document or their indexes. */
      subs?: TypeCollection<ID<TeriockDocument>, TeriockDocument>;
      /** Previously-tracked sup id, retained so a moved sub can reset its old sup. */
      supId?: ID<TeriockActiveEffect | TeriockActor | TeriockItem> | null;
      /** All valid active effects that apply to this document. */
      validEffects?: TeriockActiveEffect[];
      /** All visible children of this document or their indexes. */
      visibleChildren?: (TeriockActiveEffect | TeriockItem)[];
      /** All visible children of this document or their indexes, keyed by type. */
      visibleChildrenByType?: Record<Teriock.Documents.ChildType, (TeriockActiveEffect | TeriockItem)[]>;
    };

    export type Subtype<Base, Type extends string, Sheet, System> =
      & Omit<Base, "_id" | "documentName" | "id" | "pseudoCollections" | "sheet" | "system" | "type" | "uuid">
      & {
        _id: ID<Subtype<Base, Type, Sheet, System>>;
        sheet: Sheet;
        system: System;
        type: Type;
        get documentName(): Base extends { documentName: infer N } ? N : string;
        get id(): ID<Subtype<Base, Type, Sheet, System>>;
        get pseudoCollections(): PseudoCollections;
        get uuid(): UUID<Subtype<Base, Type, Sheet, System>>;
      };

    export type ModelMetadata = {
      armament: boolean;
      childEffectTypes: ActiveEffectType[];
      childItemTypes: ItemType[];
      consumable: boolean;
      hierarchy: boolean;
      initialKind?: string;
      isTextPage?: boolean;
      passive: boolean;
      preservedProperties: string[];
      pseudos: Record<string, string>;
      revealable: boolean;
      stats: boolean;
      tooltip: boolean;
      type: Teriock.Documents.CommonType;
      untrackable?: boolean;
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
      tooltip: boolean;
    };
  }
}

export {};
