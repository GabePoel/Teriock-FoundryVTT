declare global {
  namespace Teriock.Models {
    export type TransformationSystemData = {
      /** <schema> Transformation configuration */
      transformation: Teriock.Fields.EffectTransformationConfig;
    };
  }
}

export {};
