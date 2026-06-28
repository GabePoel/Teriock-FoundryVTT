declare global {
  namespace Teriock.Dialog {
    export type StatDialogOptions = {
      bonus?: Teriock.System.FormulaString;
      consumeStatDice?: boolean;
      forHarm?: boolean;
      title?: string;
    };

    export type HealDialogOptions = StatDialogOptions & { noStatDice?: boolean };
  }
}

export {};
