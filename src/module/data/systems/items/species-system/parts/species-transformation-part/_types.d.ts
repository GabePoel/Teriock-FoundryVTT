declare global {
  namespace Teriock.Models {
    export type SpeciesTransformationPartData = {
      /** <schema> Transformation config */
      transformation: Teriock.Transformation.SpeciesTransformationConfig;
    };
  }
}

export {};
