import type { abilityOptions } from "../../constants/options/ability-options.mjs";
import type { fonts } from "../../constants/style/fonts.mjs";

declare global {
  namespace Teriock.Parameters.Shared {
    /** Form */
    export type Form = keyof typeof abilityOptions.form;
    /** Font */
    export type Font = keyof typeof fonts;

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
