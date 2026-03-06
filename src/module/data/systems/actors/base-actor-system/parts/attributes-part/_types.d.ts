import { AttributeModel } from "../../../../../models/modifier-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorAttributesPartInterface = {
      attributes: Record<Teriock.Parameters.Actor.Attribute, AttributeModel>;
    };
  }
}

export {};
