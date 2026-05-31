// @ts-expect-error Can't find field
import { HTMLField } from "@common/data/fields";

declare global {
  namespace Teriock.Display {
    export type FancyDisplayField = {
      button?: string;
      choices?: Record<string, string>;
      classes: string;
      dataset: Record<string, string>;
      editable: boolean;
      label: string;
      path: string;
      value: never;
      visible: boolean;
    };

    export type DisplayField = string | Partial<FancyDisplayField>;

    export type DisplayButton = { button: string, label: string, update: Record<string, unknown> };

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
  }
}

export {};
