import { formulaExists } from "../../../../../helpers/formula.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";

/**
 * Equipment panel part.
 * @param {typeof EquipmentSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {EquipmentIdentificationPart}
     * @extends {EquipmentStoragePart}
     * @extends {EquipmentWieldingPart}
     * @mixin
     */
    class EquipmentPanelPart extends Base {
      /** @inheritDoc */
      async getPanelParts() {
        const bars = [
          {
            icon: TERIOCK.config.equipment.powerLevel[this.powerLevel].icon,
            label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label"),
            wrappers: [
              TERIOCK.config.equipment.powerLevel[this.powerLevel].label,
              this.equipmentTypeName,
              this.range.description,
              ...simplifyTags(this._armamentTags),
            ],
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
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", { value: this.weight }),
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.minStr", { value: this.minStr }),
              (this.identification.identified || this.isAttuned) && formulaExists(this.tier.text)
                ? _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", { value: this.tier.text })
                : "",
              ...simplifyTags(this._identificationTags),
            ],
          },
          {
            icon: TERIOCK.display.icons.equipment.storage,
            label: _loc("TERIOCK.MODELS.Storage.FIELDS.enabled.label"),
            wrappers: this.storage.enabled
              ? [
                _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedCount", {
                  max: (this.storage.maxCount ?? Infinity).toString(),
                  value: this.storage.carriedCount,
                }),
                _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeight", {
                  max: (this.storage.maxWeight ?? Infinity).toString(),
                  value: this.storage.carriedWeight,
                }),
                _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weightMultiplier", { value: this.storage.weightMultiplier }),
              ]
              : [],
          },
        ];
        return { ...(await super.getPanelParts()), bars };
      }
    }
  );
};
