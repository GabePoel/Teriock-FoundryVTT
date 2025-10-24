import type { TransformationField } from "../../shared/fields/helpers/_types";
import type { TeriockSpecies } from "../../../documents/_documents.mjs";

export interface TransformationMixinInterface {
  /** <schema> Transformation configuration */
  transformation: TransformationField & {
    /** <schema> The actual species items this is associated with on the actor */
    species: Teriock.ID<TeriockSpecies>[];
  };

  get parent(): TeriockChild;
}
