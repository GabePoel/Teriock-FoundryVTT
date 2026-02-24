import { TextField } from "../data/fields/_module.mjs";

declare global {
  namespace Teriock.Sheet {
    export type FancyDisplayField = {
      classes: string;
      dataset: Record<string, string>;
      editable: boolean;
      label: string;
      path: string;
      visible: boolean;
    };

    export type DisplayField = Partial<FancyDisplayField> | string;

    export type FancyDisplayTag = {
      label: string;
      tooltip?: string;
    };

    export type DisplayTag = Partial<FancyDisplayTag> | string;

    export type EnrichedDisplayField = {
      schema: TextField;
      value: string;
      enriched: string;
      classes: string;
      editable: boolean;
      label: string;
    };

    export type DragDropSelector = {
      dragSelector: string | null;
      dropSelector: string | null;
    };

    export type DragDropConfiguration = {
      dragDrop: Teriock.Sheet.DragDropSelector[];
    };

    export type DropData<T> = {
      data?: T;
      uuid: UUID<T>;
      type: "ActiveEffect" | "Item" | "Macro" | "Actor" | "JournalEntryPage";
      systemType?: Teriock.Documents.CommonType;
    };

    export interface EmbedDragEvent extends DragEvent {
      currentTarget: HTMLElement;
    }

    export type EquipmentSorter = (
      e: TeriockEquipment,
    ) => number | string | boolean;

    export type AbilitySorter = (
      a: TeriockAbility,
    ) => number | string | boolean;
  }
}
