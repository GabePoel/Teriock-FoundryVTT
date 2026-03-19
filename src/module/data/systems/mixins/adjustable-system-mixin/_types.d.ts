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
    };
  }
}

export {};
