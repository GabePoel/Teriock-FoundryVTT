import { TeriockActor } from "../../../documents/_module.mjs";
import { transformationOptions } from "../../../constants/options/transformation-options.mjs";

export type SpeciesTransformationConfig = {
  /** <schema> Overriding image to apply */
  img: Teriock.System.ImageString;
  /** <schema> Override whether the token has a ring */
  ring: boolean;
};

export type ActorTransformationConfig = SpeciesTransformationConfig & {
  /** <schema> ID of a transformation effect */
  primary: TeriockLingering | null;
};

export type AutomationTransformationConfig = SpeciesTransformationConfig & {
  /** <schema> Level of transformation */
  level: Teriock.Keys.TransformationLevel;
  /** <schema> Additional parameters this transformation should override */
  override: Set<keyof typeof transformationOptions.override>;
  /** <schema> Stats this transformation should reset */
  reset: Set<keyof typeof transformationOptions.reset>;
  /** <schema> Types of documents this transformation should turn off */
  suppress: Set<keyof typeof transformationOptions.suppress>;
};

export type EffectTransformationConfig = AutomationTransformationConfig & {
  /** <schema> Whether transformation is enabled */
  enabled: boolean;
  /** <schema> UUID of specific species to transform into */
  uuids: UUID<TeriockSpecies>[];
};

/** <schema> Transformation configuration */
export type TransformationData = {
  /** <schema> Whether transformation is enabled */
  enabled: boolean;
  /** <schema> Overriding image to apply */
  img: Teriock.System.ImageString;
  /** <schema> Level of transformation */
  level: Teriock.Keys.TransformationLevel;
  /** <schema> Additional parameters this transformation should override */
  override: Set<keyof typeof transformationOptions.override>;
  /** <schema> Stats this transformation should reset */
  reset: Set<keyof typeof transformationOptions.reset>;
  /** <schema> Types of documents this transformation should turn off */
  suppress: Set<keyof typeof transformationOptions.suppress>;
  /** <schema> UUID of specific species to transform into */
  uuids: UUID<TeriockSpecies>[];
};

export type TransformationField = TransformationData & {
  uuids: Set<UUID<TeriockSpecies>>[];
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

/** <schema> Who is the individual triggers the combat expiration? */
export type CombatExpirationIndividual = {
  /** <schema> Relationship to the individual that triggers expirations. */
  type: CombatExpirationSourceType;
  /** <schema> The specific {@link TeriockActor} that triggers expirations. */
  source?: UUID<TeriockActor>;
};

/** Data that defines a combat expiration */
export type CombatExpiration = {
  who: CombatExpirationIndividual;
  what: CombatExpirationMethod;
  when: CombatExpirationTiming;
};
