import { EffectTransformationConfig } from "../../../fields/tools/_types";

declare global {
  namespace Teriock.Models {
    export type TransformationSystemData = {
      /** <schema> Transformation configuration */
      transformation: EffectTransformationConfig;
    };
  }
}
