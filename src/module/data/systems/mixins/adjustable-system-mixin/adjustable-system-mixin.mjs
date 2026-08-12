import effectConfig from "../../../../constants/config/effect-config.mjs";

const { fields } = foundry.data;

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AdjustableSystem & Teriock.Models.AdjustableSystemData>}
 */
export default function AdjustableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.AdjustableSystemData}
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
        improvement: new fields.HTMLField({ initial: "" }),
        limitation: new fields.HTMLField({ initial: "" }),
      });
    }

    /** @inheritDoc */
    static kinds() {
      return effectConfig.kind;
    }

    /** @inheritDoc */
    get _displayButtons() {
      const buttons = super._displayButtons;
      if (!this.badge) {
        buttons.push({
          button: "badge",
          label: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.badge.label",
          update: { "system.badge": "x" },
        });
      }
      return buttons;
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
    get needsAttunement() {
      return this.kind !== "intrinsic" && super.needsAttunement;
    }

    /** @inheritDoc */
    _isSuppressedDampened() {
      return this.kind !== "intrinsic" && super._isSuppressedDampened();
    }
  }

  return AdjustableSystem;
}
