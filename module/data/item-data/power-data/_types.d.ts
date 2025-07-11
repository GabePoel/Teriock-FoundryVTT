import { TeriockBaseItemData } from "../base-item-data/base-item-data.mjs";
import { TeriockBaseItemSchema } from "../base-item-data/_types";

/** Allowed Power Types */
type PowerType =
  | "backstory"
  | "blessing"
  | "curse"
  | "familiar"
  | "innate"
  | "mount"
  | "pact"
  | "species"
  | "traits"
  | "other";

export interface TeriockPowerSchema extends TeriockBaseItemSchema {
  /** Power Type */
  type: PowerType;
  /** Flaws */
  flaws: string;
  /** Size (if species) */
  size: number;
  /** Lifespan (if species) */
  lifespan: number;
  /** Age of Adulthood (if species) */
  adult: number;
}

declare module "./power-data.mjs" {
  export default interface TeriockPowerData extends TeriockPowerSchema, TeriockBaseItemData {}
}
