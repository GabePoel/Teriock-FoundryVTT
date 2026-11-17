import { HTMLField } from "@common/data/fields.mjs";

declare global {
  namespace Teriock.Display {
    export type FancyDisplayField = {
      addLabel?: string;
      choices?: Record<string, string>;
      classes: string[];
      dataset: Record<string, string>;
      editable: boolean;
      group?: string;
      label: string;
      path: string;
      subgroup?: string;
      value: never;
      visible: boolean;
    };

    export type DisplayField = string | Partial<FancyDisplayField>;

    export type DisplayAddOption = {
      group?: string;
      id: string;
      label: string;
      subgroup?: string;
      update: Record<string, unknown>;
    };

    export type FancyDisplayTag = { label: string, tooltip?: string };

    export type DisplayTag = string | Partial<FancyDisplayTag>;

    export type EnrichedDisplayField = {
      classes: string[];
      editable: boolean;
      enriched: string;
      label: string;
      schema: HTMLField;
      value: string;
    };
  }
}

export {};
