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

    export type EquipmentSorter = (e: TeriockEquipment) => boolean | number | string;

    export type AbilitySorter = (a: TeriockAbility) => boolean | number | string;

    export type _SheetConfiguration = { teriock: { autoIcon?: boolean } };
  }
}

export {};
