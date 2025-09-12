declare global {
  namespace Teriock.Parameters.Shared {
    /** Form */
    export type Form = keyof typeof TERIOCK.options.ability.form;
    /** Font */
    export type Font = keyof typeof TERIOCK.display.fonts;

    /** Comparison */
    export type Comparison = "=" | "!=" | ">" | "<" | ">=" | "<=";

    /** Comparator */
    export type Comparator = {
      key: string;
      comparison: Teriock.Parameters.Shared.Comparison;
      value: any;
    };

    /** Die Stat */
    export type DieStat = "hp" | "mp";
  }
}

export {};