declare global {
  namespace Teriock.Chat {
    export type ChatButton = {
      icon: string;
      label: string;
      id: string;
      data: object;
      classes?: Set<string>;
      color?: string;
    };
  }
}
export {};
