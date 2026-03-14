import { dieOptions } from "../constants/options/die-options.mjs";

declare global {
  namespace Teriock.Rolls {
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
