import { mixClasses } from "../../../../helpers/construction.mjs";
import { CommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @implements {Teriock.Data.ActorPropagator}
 */
export default class AbstractActorSystem extends mixClasses(TypeDataModel, CommonSystemMixin) {
  /** @inheritDoc */
  prepareVirtualEffects() {}
}
