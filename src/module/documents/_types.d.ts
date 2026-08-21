import { ALL_DOCUMENT_TYPES } from "@common/constants.mjs";

import { PseudoCollection } from "../data/pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export type ChildType = ActiveEffectType | ItemType;
    export type CommonType = ActorType | Teriock.Documents.ChildType;

    export type DocumentName = (typeof ALL_DOCUMENT_TYPES)[number];

    export type PseudoCollections = {
      Activation?: PseudoCollection<Activation>;
      Affinity?: PseudoCollection<Affinity>;
      Automation?: PseudoCollection<Automation>;
      Expiration?: PseudoCollection<Expiration>;
    };

    /**
     * Store of lazily-computed values cached on a document.
     */
    export type DocumentCache = {
      /** If the document is active. */
      active?: boolean;
      /** Previously-tracked dependency id, retained so it can be untracked when it changes. */
      dep?: string;
      /** Previously-tracked typed identifier, retained so it can be untracked when it changes. */
      identifier?: TypedIdentifier;
      /** Whether this document is a reference and not "real". */
      isReference?: boolean;
      /** Whether this document is a status effect. */
      isStatus?: boolean;
      /** Previously-tracked sup id, retained so a moved sub can reset its old sup. */
      supId?: ID<TeriockActiveEffect | TeriockActor | TeriockItem> | null;
    };

    export type ModelMetadata = {
      armament: boolean;
      attunable: boolean;
      childTypes: Teriock.Documents.ChildType[];
      consumable: boolean;
      disabledPath: "disabled" | "system.disabled" | null;
      hierarchy: boolean;
      initialKind?: string;
      passive: boolean;
      preservedProperties: string[];
      pseudos: Record<string, string>;
      revealable: boolean;
      stats: boolean;
      text: boolean;
      tooltip: boolean;
      type: Teriock.Documents.CommonType;
      untrackable?: boolean;
      usable: boolean;
      visibleTypes: Teriock.Documents.CommonType[];
      wiki: boolean;
    };

    export type DocumentMetadata = { child: boolean, hierarchy: boolean, tooltip: boolean };
  }
}

export {};
