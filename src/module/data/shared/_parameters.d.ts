declare global {
  namespace Teriock.Parameters.Shared {
    /** Form */
    export type Form = keyof typeof TERIOCK.options.ability.form;
    /** Font */
    export type Font = keyof typeof TERIOCK.display.fonts;

    /** Die Stat */
    export type DieStat = "hp" | "mp";
  }
}

export {};
