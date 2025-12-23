import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface TeriockFluencyModelInterface
      extends Teriock.Models.TeriockBaseEffectModelInterface {
      /** <schema> Tradecraft field */
      field: Teriock.Parameters.Fluency.Field;
      /** <schema> Tradecraft */
      tradecraft: Teriock.Parameters.Fluency.Tradecraft;

      get parent(): TeriockFluency;
    }
  }
}
