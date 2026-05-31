import { mixClasses } from "../../../../helpers/construction.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @implements {Teriock.Data.ActorPropagator}
 */
export default class AbstractActorSystem extends mixClasses(TypeDataModel, systemMixins.CommonSystemMixin) {
  /** @inheritDoc */
  prepareVirtualEffects() {}
}
