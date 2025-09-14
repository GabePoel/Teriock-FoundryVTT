declare global {
  namespace Teriock.Dialog {
    export type StatDialogOptions = {
      forHarm?: boolean,
      consumeStatDice?: boolean,
      title?: string,
    }

    export type HealDialogOptions = StatDialogOptions & {
      noStatDice?: boolean,
    }
  }
}

export {};
