declare global {
  namespace Teriock.Models {
    export type AdjustableSystemData = {
      /** <schema> Badge */
      badge: string;
      /** <schema> Form */
      form: Teriock.Keys.Form;
      /** <schema> Improvement description */
      improvement: string;
      /** <schema> Limitation description */
      limitation: string;
      /** <schema> Power sources that must be available in order for this ability to work */
      powerSources: Set<Teriock.Keys.PowerSource>;
    };
  }
}

export {};
