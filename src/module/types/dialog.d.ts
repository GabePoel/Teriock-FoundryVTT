declare global {
  namespace Teriock.Dialog {
    export type StatDialogOptions = {
      consumeStatDice?: boolean;
      forHarm?: boolean;
      substitution?: Teriock.System.FormulaString;
      title?: string;
    };

    export type HealDialogOptions = StatDialogOptions & { noStatDice?: boolean };
  }
}

export {};
