declare global {
  namespace Teriock.Models {
    export interface TransformationSystemData {
      /** <schema> Transformation configuration */
      transformation: Teriock.Transformation.EffectTransformationConfig;
    }
  }
}

export {};
