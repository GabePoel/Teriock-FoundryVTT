import { effectOptions } from "../../../../constants/options/effect-options.mjs";
import { TextField } from "../../../fields/_module.mjs";

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
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Adjustable",
      ];

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system.badge",
        ...this._adjustableTextFields,
        ...super.PRESERVED_PROPERTIES,
      ];

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
            choices: effectOptions.form,
            initial: "normal",
          }),
          improvement: new TextField({ initial: "" }),
          limitation: new TextField({ initial: "" }),
          mundane: new fields.BooleanField({ initial: false }),
        });
      }

      /** @inheritDoc */
      get _isSuppressedDeattuned() {
        return (
          !this.mundane &&
          this.form !== "intrinsic" &&
          super._isSuppressedDeattuned
        );
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
    }
  );
}
