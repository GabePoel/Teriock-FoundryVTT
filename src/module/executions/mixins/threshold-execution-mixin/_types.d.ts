declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions = Teriock.Execution.ExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      threshold?: number;
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
      openable?: boolean;
      selectHint?: string;
      selectTitle?: string;
      getChoices?: () => AnyChildDocument[] | Promise<AnyChildDocument[]>;
      update?: (document: AnyChildDocument | null) => Promise<void> | void;
    };
  }
}

export {};
