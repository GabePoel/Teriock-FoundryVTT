import effectConfig from "../../../../../../constants/config/effect-config.mjs";
import { addFormula } from "../../../../../../helpers/formula.mjs";
import { initialNumber } from "../../../../../fields/tools/initializers.mjs";

/**
 * Actor data model that handles cover.
 *
 * Relevant wiki pages:
 * - [Cover](https://wiki.teriock.com/index.php/Core:Cover)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorCoverPart & Teriock.Models.ActorCoverPartData>}
 */
export default function ActorCoverPart(Base) {
  /**
   * @implements {Teriock.Models.ActorCoverPartData}
   * @mixin
   * @property {AnyActor} parent
   */
  class ActorCoverPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { cover: initialNumber() });
    }

    /**
     * Decrease cover by one step.
     * @param {number} [amount]
     * @returns {Promise<void>}
     */
    async decreaseCover(amount = 1) {
      const value = this.parent.system.cover;
      const min = Math.max(0, value - amount);
      const ids = [];
      for (let i = value; i > min; i--) { ids.push(effectConfig.cover[i - 1]); }
      await this.parent.removeStatusEffects(ids);
    }

    /**
     * Increase cover by one step.
     * @param {number} [amount]
     * @returns {Promise<void>}
     */
    async increaseCover(amount = 1) {
      const value = this.parent.system.cover;
      const max = Math.min(3, value + amount);
      const ids = [];
      for (let i = value; i < max; i++) { ids.push(effectConfig.cover[i]); }
      await this.parent.applyStatusEffects(ids);
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.cover === 1) {
        this.defense.ac += 2;
        this.attributes.mov.bonus = addFormula(this.attributes.mov.bonus, "2");
      } else if (this.cover >= 2) {
        this.defense.ac += 5;
        this.attributes.mov.bonus = addFormula(this.attributes.mov.bonus, "5");
      }
    }
  }

  return ActorCoverPart;
}
