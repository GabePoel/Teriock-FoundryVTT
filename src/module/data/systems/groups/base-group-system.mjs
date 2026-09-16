import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

export default class BaseGroupSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /**
   * The combat this belongs to.
   * @returns {TeriockCombat|null}
   */
  get combat() {
    return this.parent.parent;
  }
}
