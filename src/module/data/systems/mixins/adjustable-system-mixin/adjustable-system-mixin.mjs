import { TextField } from "../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildSystem} Base
 */
export default function AdjustableSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @extends {Teriock.Models.AdjustableSystemInterface}
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
        "system.tag",
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
          improvement: new TextField({ initial: "" }),
          limitation: new TextField({ initial: "" }),
          tag: new fields.StringField({ initial: "" }),
        });
      }

      /** @inheritDoc */
      get _nameTags() {
        const tags = [];
        if (this.limitation && this.limitation.length > 0) {
          tags.push(
            game.i18n.localize("TERIOCK.SYSTEMS.Adjustable.NAME.limited"),
          );
        }
        if (this.improvement && this.improvement.length > 0) {
          tags.push(
            game.i18n.localize("TERIOCK.SYSTEMS.Adjustable.NAME.improved"),
          );
        }
        return [...tags, ...super._nameTags];
      }

      /** @inheritDoc */
      get _nameValue() {
        return this.tag || "";
      }
    }
  );
}
