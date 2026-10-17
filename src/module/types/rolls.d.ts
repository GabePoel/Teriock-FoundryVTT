declare global {
  namespace Teriock.Rolls {
    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = 10 | 100 | 12 | 2 | 20 | 4 | 6 | 8;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;
  }
}

export {};
