import { TransformationImplementationField } from "../../fields/helpers/_types";

declare global {
  namespace Teriock.Models {
    export interface TransformationMixinInterface {
      /** <schema> Transformation configuration */
      transformation: TransformationImplementationField;
    }
  }
}
