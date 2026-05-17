import { effectConfig } from "../../../../../../constants/config/effect-config.mjs";
import { addFormula } from "../../../../../../helpers/formula.mjs";
import { initialNumber } from "../../../../../fields/helpers/initializers.mjs";

/**
 * Actor data model that handles cover.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorCoverPartData}
     * @mixin
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
        for (let i = value; i > min; i--) {
          ids.push(effectConfig.cover[i - 1]);
        }
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
        for (let i = value; i < max; i++) {
          ids.push(effectConfig.cover[i]);
        }
        await this.parent.applyStatusEffects(ids);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        if (this.cover === 1) {
          this.defense.ac += 2;
          this.attributes.mov.raw = addFormula(this.attributes.mov.raw, "2");
        } else if (this.cover >= 2) {
          this.defense.ac += 5;
          this.attributes.mov.raw = addFormula(this.attributes.mov.raw, "5");
        }
      }
    }
  );
};
