import { TextField } from "../data/fields/_module.mjs";

declare global {
  namespace Teriock.Sheet {
    export type FancyDisplayField = {
      button?: string;
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
      classes: string;
      editable: boolean;
      enriched: string;
      label: string;
      schema: TextField;
      value: string;
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
      systemType?: Teriock.Documents.CommonType;
      type:
        | "ActiveEffect"
        | "Actor"
        | "Automation"
        | "Item"
        | "JournalEntryPage"
        | "Macro";
      uuid: UUID<T>;
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
