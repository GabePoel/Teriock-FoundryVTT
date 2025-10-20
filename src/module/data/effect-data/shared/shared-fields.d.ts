import { TeriockEffect } from "../../../documents/_module.mjs";
import type { TeriockSpecies } from "../../../documents/_documents.mjs";

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
  level: "minor" | "full" | "greater";
  /** <schema> Documents to suppress */
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
  uuid: Teriock.UUID<TeriockSpecies>;
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
