import { getName } from "../../../../../utils/_module.mjs";
import { Panel } from "../../../../pseudo-documents/_module.mjs";

/**
 * Equipment panel part.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function EquipmentPanelPart(Base) {
  /**
   * @mixin
   * @property {TeriockItem<"equipment">} parent
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
          icon: TERIOCK.DISPLAY.icons.manifest.equipment.equipmentType,
          label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label"),
          wrappers: [getName(this.equipmentType), this.range.description, ...Panel.simplifyTags(this._armamentTags)],
        },
        this._attackBar,
        this._defenseBar,
        {
          icon: TERIOCK.DISPLAY.icons.manifest.equipment.equipmentClasses,
          label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label"),
          wrappers: [...Panel.simplifyTags(this._equipmentClassesTags)],
        },
        {
          icon: TERIOCK.DISPLAY.icons.manifest.armament.load,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.load"),
          wrappers: [
            ...Panel.simplifyTags(this._identificationTags),
            ...this._attunableWrappers,
            this.weight.valueAbbreviation,
            _loc("TERIOCK.SYSTEMS.Equipment.PANELS.minStr", { value: this.minStr }),
            this.price.unitType === "finite" ? this.price.valueAbbreviation : "",
          ],
        },
        {
          icon: TERIOCK.DISPLAY.icons.manifest.equipment.storage,
          label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.storage.enabled.label"),
          wrappers: this.storage.enabled
            ? [
              _loc(
                `TERIOCK.SYSTEMS.Equipment.PANELS.carriedCount${this.storage.count.max === Infinity ? "NoMax" : ""}${
                  this.storage.count.value === 1 ? "Singular" : ""
                }`,
                {
                  max: this.storage.count.max === Infinity ? "" : this.storage.count.max.toString(),
                  value: this.storage.count.value,
                },
              ),
              this.storage.weight.max.unitType !== "finite"
                ? _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeightNoMax", { value: this.storage.weight.value })
                : _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeight", {
                  max: this.storage.weight.max.value.toString(),
                  value: this.storage.weight.value,
                }),
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weightMultiplier", { value: this.storage.weight.multiplier }),
            ]
            : [],
        },
      ]);
      return { ...(await super.getPanelParts()), bars };
    }
  }

  return EquipmentPanelPart;
}
