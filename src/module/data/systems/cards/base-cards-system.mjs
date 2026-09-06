import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @mixes BaseSystem
 */
export default class BaseCardsSystem extends mixClasses(TypeDataModel, BaseSystemMixin) {
  /** @inheritDoc */
  get actor() {
    return game.actors.default;
  }
}
