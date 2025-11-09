// noinspection JSUnusedGlobalSymbols

declare global {
  namespace Teriock.Parameters.Shared {
    /** Form */
    export type Form = keyof typeof TERIOCK.options.ability.form;
    /** Font */
    export type Font = keyof typeof TERIOCK.display.fonts;
    /** Die Stat */
    export type DieStat = "hp" | "mp";
    /** Color */
    export type Color = keyof typeof TERIOCK.display.colors;
    /** Transformation level */
    export type TransformationLevel =
      keyof typeof TERIOCK.options.effect.transformationLevel;
    /** Illusion level */
    export type illusionLevel =
      keyof typeof TERIOCK.options.effect.illusionLevel;
  }
}

export {};
