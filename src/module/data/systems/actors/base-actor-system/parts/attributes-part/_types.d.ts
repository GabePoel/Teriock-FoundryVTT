import { AttributeModel } from "../../../../../models/modifier-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActorAttributesPartData {
      attributes: Record<Teriock.Keys.Attribute, AttributeModel>;
    }
  }
}

export {};
