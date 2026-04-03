import { EffectTransformationConfig } from "../../../fields/helpers/_types";

declare global {
  namespace Teriock.Models {
    export type TransformationSystemData = {
      /** <schema> Transformation configuration */
      transformation: EffectTransformationConfig;
    };
  }
}
