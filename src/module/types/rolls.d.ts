import { dieConfig } from "../constants/config/die-config.mjs";

declare global {
  namespace Teriock.Rolls {
    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = keyof typeof dieConfig.faces;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;
  }
}
