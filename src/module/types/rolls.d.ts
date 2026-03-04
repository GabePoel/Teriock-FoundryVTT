import { dieOptions } from "../constants/options/die-options.mjs";

declare global {
  namespace Teriock.Rolls {
    // noinspection SpellCheckingInspection
    export type RollMode =
      | "roll"
      | "publicroll"
      | "gmroll"
      | "blindroll"
      | "selfroll";

    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = keyof typeof dieOptions.faces;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;
  }
}
