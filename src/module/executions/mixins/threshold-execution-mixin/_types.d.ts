import type { DataField } from "@common/data/fields.mjs";

declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions = Teriock.Execution.BaseExecutionOptions &
      Teriock.Interaction.ThresholdOptions;

    export type ExecutionDialogEntry = {
      condition: (() => boolean) | boolean;
      field: DataField;
      hint?: string;
      integer?: number;
      label: string;
      max?: number;
      min?: number;
      name: string;
      placeholder?: number | string;
      small: boolean;
      update: (value: boolean | number | string) => void;
      value: boolean | number | string;
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
