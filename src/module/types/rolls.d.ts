import mathConfig from "../constants/config/math-config.mjs";

declare global {
  namespace Teriock.Rolls {
    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = keyof typeof mathConfig.dieFaces;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;
  }
}
