import { effectConfig } from "../../../../constants/config/effect-config.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseEffectSystem} Base
 */
export default function AdjustableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AdjustableSystemData}
     * @mixin
     */
    class AdjustableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Adjustable"];

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.badge", ...this._adjustableTextFields, ...super.PRESERVED_PROPERTIES];

      /**
       * @returns {string[]}
       */
      static get _adjustableTextFields() {
        return ["system.improvement", "system.limitation"];
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          badge: new fields.StringField({ initial: "" }),
          form: new fields.StringField({
            choices: effectConfig.form,
            initial: "normal",
          }),
          improvement: new fields.HTMLField({ initial: "" }),
          limitation: new fields.HTMLField({ initial: "" }),
        });
      }

      /** @inheritDoc */
      get _isSuppressedDampened() {
        return this.form !== "intrinsic" && super._isSuppressedDampened;
      }

      /** @inheritDoc */
      get _nameBadge() {
        return this.badge || "";
      }

      /** @inheritDoc */
      get _nameTags() {
        const tags = [];
        if (this.limitation && this.limitation.length > 0) {
          tags.push(_loc("TERIOCK.SYSTEMS.Adjustable.NAME.limited"));
        }
        if (this.improvement && this.improvement.length > 0) {
          tags.push(_loc("TERIOCK.SYSTEMS.Adjustable.NAME.improved"));
        }
        return [...tags, ...super._nameTags];
      }

      /** @inheritDoc */
      get color() {
        return TERIOCK.config.effect.form[this.form].color;
      }

      /** @inheritDoc */
      get needsAttunement() {
        return this.form !== "intrinsic" && super.needsAttunement;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          [`form.${this.form}`]: 1,
          form: this.form,
        });
      }
    }
  );
}
