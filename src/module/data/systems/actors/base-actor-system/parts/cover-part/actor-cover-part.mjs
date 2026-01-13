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
       * @returns {Promise<void>}
       */
      async decreaseCover() {
        if (this.parent.statuses.has("fullCover")) {
          await this.parent.toggleStatusEffect("fullCover", { active: false });
        } else if (this.parent.statuses.has("threeQuartersCover")) {
          await this.parent.toggleStatusEffect("threeQuartersCover", {
            active: false,
          });
        } else if (this.parent.statuses.has("halfCover")) {
          await this.parent.toggleStatusEffect("halfCover", { active: false });
        }
      }

      /**
       * Increase cover by one step.
       * @returns {Promise<void>}
       */
      async increaseCover() {
        if (!this.parent.statuses.has("halfCover")) {
          await this.parent.toggleStatusEffect("halfCover", { active: true });
        } else if (!this.parent.statuses.has("threeQuartersCover")) {
          await this.parent.toggleStatusEffect("threeQuartersCover", {
            active: true,
          });
        } else if (!this.parent.statuses.has("fullCover")) {
          await this.parent.toggleStatusEffect("fullCover", { active: true });
        }
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
