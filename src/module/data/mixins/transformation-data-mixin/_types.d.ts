import type { TransformationImplementationField } from "../../shared/fields/helpers/_types";

export interface TransformationMixinInterface {
  /** <schema> Transformation configuration */
  transformation: TransformationImplementationField;

  get parent(): TeriockChild;
}
