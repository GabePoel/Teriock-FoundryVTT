declare global {
  namespace Teriock.Activations {
    export type BaseActivationData = {
      display: { classes: Set<string>, icon: string, label: string, tooltip: string }[];
    };
  }
}

export {};
