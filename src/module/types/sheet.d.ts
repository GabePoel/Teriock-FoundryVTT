import { MechanicPseudoDocument } from "../data/pseudo-documents/abstract/_module.mjs";
import { TypeCollection } from "../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Sheet {
    export type DragDropSelector = { dragSelector: string | null, dropSelector: string | null };

    export type DragDropConfiguration = { dragDrop: Teriock.Sheet.DragDropSelector[] };

    export type DropData<T> = {
      data?: T;
      systemType?: Teriock.Documents.CommonType;
      type: "ActiveEffect" | "Actor" | "Automation" | "Item" | "JournalEntryPage" | "Macro";
      uuid: UUID<T>;
    };

    export interface EmbedDragEvent extends DragEvent {
      currentTarget: HTMLElement;
    }

    export type MechanicCollectionConfig = {
      baseClass: typeof MechanicPseudoDocument;
      collection: TypeCollection<ID<MechanicPseudoDocument>, MechanicPseudoDocument>;
      hint: string;
      icon: string;
      title: string;
      types: Record<string, typeof MechanicPseudoDocument>;
    };

    export type MechanicTab = {
      active: boolean;
      cssClass: string;
      group: "mechanics";
      icon: string;
      id: "automations" | "expirations";
      label: string;
    };

    export type MechanicEntry = {
      collapsed: boolean;
      formEditor: string;
      mechanic: Teriock.PseudoDocuments.MechanicPseudoDocumentData;
      tips: Teriock.UI.Tip[];
    };

    export type _SheetConfiguration = Teriock.Application._ApplicationConfiguration & {
      teriock: { autoIcon?: boolean };
    };
  }
}

export {};
