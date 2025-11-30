import { TextField } from "../data/shared/fields/_module.mjs";

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

    export type EnrichedDisplayField = {
      schema: TextField;
      value: string;
      enriched: string;
      classes: string;
      editable: boolean;
      label: string;
    };
  }
}
