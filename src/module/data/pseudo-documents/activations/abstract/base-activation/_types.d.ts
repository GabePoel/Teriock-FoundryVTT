declare module "./base-activation.mjs" {
  export default interface BaseActivation {
    display: { classes: Set<string>, icon: string, label: string, tooltip: string }[];
  }
}

export {};
