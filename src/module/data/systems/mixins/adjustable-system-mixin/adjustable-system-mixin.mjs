import { effectConfig } from "../../../../constants/config/effect-config.mjs";
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
          improvement: new TextField({ initial: "" }),
          limitation: new TextField({ initial: "" }),
          powerSources: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.reference.powerSources,
            }),
          ),
        });
      }

      /**
       * Metaphysics display inputs.
       * @returns {Teriock.Sheet.DisplayField[]}
       */
      get _displayInputsMetaphysics() {
        return ["system.powerSources"];
      }

      /** @inheritDoc */
      get _isSuppressedDampened() {
        return this.form !== "intrinsic" && super._isSuppressedDampened;
      }

      /** @inheritDoc */
      get _metaphysicsTags() {
        return [
          ...super._metaphysicsTags,
          ...Array.from(this.powerSources).map(t => {
            return {
              label: TERIOCK.reference.powerSources[t],
              tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.powerSources.label",
            };
          }),
        ];
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
      get displayInputs() {
        return [...super.displayInputs, ...this._displayInputsMetaphysics];
      }

      /** @inheritDoc */
      get needsAttunement() {
        return this.form !== "intrinsic" && super.needsAttunement;
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = Object.assign(super.getLocalRollData(), {
          [`form.${this.form}`]: 1,
          form: this.form,
        });
        for (const powerSource of this.powerSources) {
          data[`power.${powerSource}`] = 1;
        }
        return data;
      }
    }
  );
}
