import { SpeciesTransformationConfig } from "../../../../../fields/tools/_types.js";

declare global {
  namespace Teriock.Models {
    export type SpeciesTransformationPartData = {
      /** <schema> Transformation config */
      transformation: SpeciesTransformationConfig;
    };
  }
}

export {};
