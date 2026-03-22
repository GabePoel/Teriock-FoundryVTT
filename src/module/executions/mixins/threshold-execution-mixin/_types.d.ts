import type { DataField } from "@common/data/fields.mjs";

declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions =
      Teriock.Execution.BaseExecutionOptions &
        Teriock.Interaction.ThresholdOptions;

    export type ExecutionDialogEntry = {
      condition: boolean | (() => boolean);
      field: DataField;
      hint?: string;
      integer?: number;
      label: string;
      max?: number;
      min?: number;
      name: string;
      placeholder?: string | number;
      update: (value: string | number | boolean) => void;
      value: string | number | boolean;
    };

    export type ExecutionDialogButton = {
      action: string;
      icon?: string;
      label?: string;
      callback?: () => void;
      default?: boolean;
    };
  }
}
