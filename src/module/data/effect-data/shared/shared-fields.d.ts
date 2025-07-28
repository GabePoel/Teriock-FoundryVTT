import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockItem from "../../../documents/item.mjs";
import type TeriockActor from "../../../documents/actor.mjs";

export type HierarchyField = {
  /** The ID of the {@link TeriockEffect} that this is descended from, if there is one. */
  supId: Teriock.ID<TeriockEffect> | null;
  /** The IDs for each {@link TeriockEffect} that could be descended from this. */
  subIds: Set<Teriock.ID<TeriockEffect>>;
  /**
   * The UUID of the {@link TeriockActor} or {@link TeriockItem} this {@link TeriockAbility} is embedded in.
   * This is calculated when the {@link TeriockAbility} is created and should not be set manually.
   */
  rootUuid: Teriock.UUID<TeriockItem | TeriockActor>;
};

/** What actor is the source who triggers expirations? */
export type CombatExpirationSourceType = "target" | "executor" | "everyone";

/**  What is the type of method of this expiration? */
export type CombatExpirationMethod = {
  /**  What is the type of thing that causes this to expire? */
  type: "forced" | "rolled" | "none";
  /** If this expires on a roll, what is the roll that needs to be made? */
  roll: "2d4kh1";
  /** What is the minimum value that needs to be rolled in order for this to expire? */
  threshold: number;
};

/** When in the combat this effect expires. */
export type CombatExpirationTiming = {
  /** What is the timing for the trigger of this effect expiring? */
  time: "start" | "end";
  /** What is the trigger for this effect expiring? */
  trigger: "turn" | "combat" | "action";
  /** A number of instances of the trigger firing to skip before this effect expires. */
  skip: number;
};
