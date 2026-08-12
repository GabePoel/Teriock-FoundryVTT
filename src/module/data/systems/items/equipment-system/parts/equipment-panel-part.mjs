import { simplifyTags } from "../../../../../helpers/panel.mjs";
import { getName } from "../../../../../helpers/utils.mjs";

/**
 * Equipment panel part.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, EquipmentPanelPart>}
 */
export default function EquipmentPanelPart(Base) {
  /**
   * @mixin
   * @property {TeriockEquipment} parent
   */
  class EquipmentPanelPart extends Base {
    /** @inheritDoc */
    get _shouldShowTierWrapper() {
      return (this.identification.identified || this.isAttuned) && super._shouldShowTierWrapper;
    }

    /** @inheritDoc */
    async getPanelParts() {
      const bars = this._withKindBar([
        {
          icon: TERIOCK.display.icons.equipment.equipmentType,
          label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label"),
          wrappers: [getName(this.equipmentType), this.range.description, ...simplifyTags(this._armamentTags)],
        },
        this._attackBar,
        this._defenseBar,
        {
          icon: TERIOCK.display.icons.equipment.equipmentClasses,
          label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label"),
          wrappers: [...simplifyTags(this._equipmentClassesTags)],
        },
        {
          icon: TERIOCK.display.icons.armament.load,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.load"),
          wrappers: [
            ...simplifyTags(this._identificationTags),
            ...this._attunableWrappers,
            _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", { value: this.weight }),
            _loc("TERIOCK.SYSTEMS.Equipment.PANELS.minStr", { value: this.minStr }),
            typeof this.price === "number"
              ? _loc("TERIOCK.SYSTEMS.Equipment.PANELS.price", { value: this.price.toNearest(0.01) })
              : "",
          ],
        },
        {
          icon: TERIOCK.display.icons.equipment.storage,
          label: _loc("TERIOCK.MODELS.Storage.FIELDS.enabled.label"),
          wrappers: this.storage.enabled
            ? [
              _loc(
                `TERIOCK.SYSTEMS.Equipment.PANELS.carriedCount${this.storage.maxCount === Infinity ? "NoMax" : ""}${
                  this.storage.carriedCount === 1 ? "Singular" : ""
                }`,
                {
                  max: this.storage.maxCount === Infinity ? "" : this.storage.maxCount.toString(),
                  value: this.storage.carriedCount,
                },
              ),
              this.storage.maxWeight === Infinity
                ? _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeightNoMax", { value: this.storage.carriedWeight })
                : _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeight", {
                  max: this.storage.maxWeight.toString(),
                  value: this.storage.carriedWeight,
                }),
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weightMultiplier", { value: this.storage.weightMultiplier }),
            ]
            : [],
        },
      ]);
      return { ...(await super.getPanelParts()), bars };
    }
  }

  return EquipmentPanelPart;
}
