import { coverData } from "../../../../../../constants/data/cover.mjs";
import { addFormula } from "../../../../../../helpers/formula.mjs";

/**
 * Actor data model that handles cover.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorCoverPartInterface}
     * @mixin
     */
    class ActorCoverPart extends Base {
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
          ids.push(coverData["cover" + i.toString()].id);
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
          ids.push(coverData["cover" + (i + 1).toString()].id);
        }
        await this.parent.applyStatusEffects(ids);
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.cover = 0;
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
