import { ALL_DOCUMENT_TYPES } from "@common/constants.mjs";

declare global {
  /** The subtype-specific part of a document. */
  type Subtype<Systems, T extends keyof Systems> = { system: Systems[T], type: T };

  namespace Teriock.Documents {
    /** Child documents grouped by subtype. */
    export type ChildrenByType =
      & { [K in ActiveEffectType]: TeriockActiveEffect<K>[]; }
      & { [K in ItemType]: TeriockItem<K>[]; };

    export type ChildType = ActiveEffectType | ItemType;
    export type CommonType = ActorType | Teriock.Documents.ChildType;

    export type DocumentName = (typeof ALL_DOCUMENT_TYPES)[number];

    /**
     * Store of lazily-computed values cached on a document.
     */
    export type DocumentCache = {
      /** If the document is active. */
      active?: boolean;
      /** Previously-tracked dependency id. This is retained so it can be untracked when it changes. */
      dep?: string;
      /** Previously-tracked typed identifier. This is retained so it can be untracked when it changes. */
      identifier?: TypedIdentifier;
      /** Whether this document is a reference and not "real". */
      isReference?: boolean;
      /** Whether this document is a status effect. */
      isStatus?: boolean;
      /** Previously-tracked sup id, retained so a moved sub can reset its old sup. */
      supId?: ID<TeriockActiveEffect | TeriockActor | TeriockItem> | null;
    };

    /**
     * Store of lazily-computed values cached on an actor.
     */
    export type ActorCache = DocumentCache & {
      /** Whether the actor's token was last in difficult terrain. */
      difficultTerrain?: boolean;
      /** Hiding score the actor's tokens were last refreshed with. */
      hiding?: number;
      /** Perceiving score the actor's tokens were last refreshed with. */
      perceiving?: number;
      /** Previously-prepared statuses. This is retained so status expirations can find what changed. */
      statuses?: Set<Teriock.Keys.Condition>;
      /** Previously-prepared token terrains. This is retained so terrain regions can find what changed. */
      terrains?: Set<Teriock.Keys.Terrain>;
    };

    export type DocumentMetadata = { child: boolean, hierarchy: boolean, tooltip: boolean };
  }
}

export {};
