import { MechanicPseudoDocument } from "../data/pseudo-documents/abstract/_module.mjs";
import { PseudoCollection } from "../data/pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Sheet {
    export type MechanicCollectionConfig = {
      addLabel: string;
      baseClass: typeof MechanicPseudoDocument;
      collection: PseudoCollection<MechanicPseudoDocument>;
      hint: string;
      icon: string;
      id: string;
      title: string;
      types: Record<string, typeof MechanicPseudoDocument>;
    };

    export type MechanicEntry = {
      collapsed: boolean;
      formEditor: string;
      mechanic: Teriock.PseudoDocuments.MechanicPseudoDocumentData;
      tips: Teriock.UI.Tip[];
    };

    export type _SheetConfiguration = Teriock.Application._ApplicationConfiguration & {
      teriock?: { autoIcon?: boolean };
    };
  }
}

export {};
