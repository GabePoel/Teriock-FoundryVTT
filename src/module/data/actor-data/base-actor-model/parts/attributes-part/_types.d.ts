import { AttributeModel } from "../../../../models/modifier-models/_module.mjs";

export default interface ActorAttributesPartInterface {
  attributes: Record<Teriock.Parameters.Actor.Attribute, AttributeModel>;
}
