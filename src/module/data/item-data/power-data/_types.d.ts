import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockPower } from "../../../documents/_documents.mjs";

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

export interface TeriockPowerSchema extends TeriockBaseItemData {
  /** Parent */
  parent: TeriockPower;
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
  export default interface TeriockPowerData extends TeriockPowerSchema {}
}
