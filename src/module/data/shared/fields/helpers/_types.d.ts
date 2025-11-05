import type {
  TeriockEffect,
  TeriockFolder,
} from "../../../../documents/_module.mjs";
import type { TeriockSpecies } from "../../../../documents/_documents.mjs";

/** <schema> {@link TeriockEffect} hierarchy */
export type HierarchyField = {
  /**
   * <schema> <derived> The UUID of the {@link TeriockParent} this {@link TeriockAbility} is
   * embedded in. This is calculated when the {@link TeriockAbility} is created and should not be set manually.
   */
  rootUuid: Teriock.UUID<TeriockParent>;
  /** <schema> The IDs for each {@link TeriockEffect} that could be descended from this. */
  subIds: Set<Teriock.ID<TeriockEffect>>;
  /** <schema> The ID of the {@link TeriockEffect} that this is descended from, if there is one. */
  supId: Teriock.ID<TeriockEffect> | null;
};

/** <schema> Transformation configuration */
export type TransformationField = {
  /** <schema> Whether transformation is enabled */
  enabled: boolean;
  /** <schema> Overriding image to apply */
  image: string;
  /** <schema> Level of transformation */
  level: Teriock.Parameters.Shared.TransformationLevel;
  /** <schema> Reset HP upon applying transformation */
  resetHp: boolean;
  /** <schema> Reset MP upon applying transformation */
  resetMp: boolean;
  /** <schema> Select a species to transform into instead of getting all options. */
  suppression: {
    /** <schema> Whether to suppress body parts */
    bodyParts: boolean;
    /** <schema> Whether to suppress equipment */
    equipment: boolean;
    /** <schema> Whether to suppress fluencies */
    fluencies: boolean;
    /** <schema> Whether to suppress ranks */
    ranks: boolean;
  };
  /** <schema> UUID of specific species to transform into */
  uuids: Set<Teriock.UUID<TeriockSpecies>>;
};

export type TransformationConfigurationField = TransformationField & {
  select: boolean;
  /** <schema> Use a folder instead of a set of species UUIDS. */
  useFolder: boolean /** <schema> Documents to suppress */;
  /** <schema> UUID of folder to use. */
  uuid: Teriock.UUID<TeriockFolder>;
  /** <schema> Allow selection of multiple species. */
  multiple: boolean;
};

export type TransformationImplementationField = TransformationField & {
  /** <schema> The actual species items this is associated with on the actor */
  species: Teriock.ID<TeriockSpecies>[];
};

/** <schema> What is the relationship of the {@link TeriockActor} that triggers expirations? */
export type CombatExpirationSourceType = "target" | "executor" | "everyone";

/**  <schema> What is the method of this expiration? */
export type CombatExpirationMethod = {
  /** <schema> If this expires on a roll, what is the roll that needs to be made? */
  roll: "2d4kh1";
  /** <schema> What is the minimum value that needs to be rolled in order for this to expire? */
  threshold: number;
  /**  <schema> What is the type of thing that causes this to expire? */
  type: "forced" | "rolled" | "none";
};

/** <schema> When in the combat does this effect expire? */
export type CombatExpirationTiming = {
  /** <schema> A number of instances of the trigger firing to skip before this effect expires. */
  skip: number;
  /** <schema> What is the timing for the trigger of this effect expiring? */
  time: "start" | "end";
  /** <schema> What is the trigger for this effect expiring? */
  trigger: "turn" | "combat" | "action";
};
