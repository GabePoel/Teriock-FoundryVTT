import type { DataField } from "@common/data/fields.mjs";

declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions = Teriock.Execution.BaseExecutionOptions & Teriock.Command.ThresholdOptions;

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
      small?: boolean;
      value: boolean | number | string;
      update: (value: boolean | number | string) => void;
    };

    export type ExecutionDialogButton = {
      action?: string;
      default?: boolean;
      icon?: string;
      label: string;
      name: string;
      callback?: () => void;
    };

    export type ExecutionDialogDocument = {
      document: AnyChildDocument | null | undefined;
      editable?: boolean;
      label?: string;
      selectHint?: string;
      selectTitle?: string;
      getChoices?: () => AnyChildDocument[] | Promise<AnyChildDocument[]>;
      update?: (document: AnyChildDocument | null) => Promise<void> | void;
    };
  }
}
