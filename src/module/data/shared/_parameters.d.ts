// noinspection JSUnusedGlobalSymbols

import { effectOptions } from "../../constants/options/effect-options.mjs";
import { fonts } from "../../constants/display/fonts.mjs";
import { abilityOptions } from "../../constants/options/ability-options.mjs";
import { colors } from "../../constants/display/colors.mjs";

declare global {
  namespace Teriock.Parameters.Shared {
    /** Form */
    export type Form = keyof typeof abilityOptions.form;
    /** Font */
    export type Font = keyof typeof fonts;
    /** Die Stat */
    export type DieStat = "hp" | "mp";
    /** Color */
    export type Color = keyof typeof colors;
    /** Transformation level */
    export type TransformationLevel =
      keyof typeof effectOptions.transformationLevel;
    /** Illusion level */
    export type IllusionLevel = keyof typeof effectOptions.illusionLevel;
  }
}

export {};
