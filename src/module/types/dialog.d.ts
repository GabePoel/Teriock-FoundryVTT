declare global {
  namespace Teriock.Dialog {
    export type StatDialogOptions = { consumeStatDice?: boolean, forHarm?: boolean, title?: string };

    export type HealDialogOptions = StatDialogOptions & { noStatDice?: boolean };
  }
}

export {};
