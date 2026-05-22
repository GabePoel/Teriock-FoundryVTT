// @ts-expect-error Can't find field
import { HTMLField } from "@common/data/fields";

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

    export type DisplayField = string | Partial<FancyDisplayField>;

    export type DisplayButton = { action?: string, classes: string, label: string };

    export type FancyDisplayTag = { label: string, tooltip?: string };

    export type DisplayTag = string | Partial<FancyDisplayTag>;

    export type EnrichedDisplayField = {
      classes: string;
      editable: boolean;
      enriched: string;
      label: string;
      schema: HTMLField;
      value: string;
    };

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
  }
}
