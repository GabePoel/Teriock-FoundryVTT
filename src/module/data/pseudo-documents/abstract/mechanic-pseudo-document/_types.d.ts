declare module "./mechanic-pseudo-document/mechanic-pseudo-document.mjs" {
  export default interface MechanicPseudoDocument extends Teriock.PseudoDocuments.MechanicPseudoDocumentData {
    _id: ID<MechanicPseudoDocument>;
  }
}

declare global {
  namespace Teriock.PseudoDocuments {
    export type MechanicPseudoDocumentData = {
      activeQualifier: Teriock.System.FormulaString;
      competencies: Set<number>;
      heighten: Set<number>;
    };
  }
}

export {};
