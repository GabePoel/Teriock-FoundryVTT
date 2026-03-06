import { TransformationImplementationField } from "../../../fields/helpers/_types";

declare global {
  namespace Teriock.Models {
    export type TransformationSystemInterface = {
      /** <schema> Transformation configuration */
      transformation: TransformationImplementationField;
    };
  }
}
