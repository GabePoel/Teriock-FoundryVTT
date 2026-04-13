import { formulaExists } from "../../../../../helpers/formula.mjs";
import { simplifyTags } from "../../../../../helpers/panel.mjs";
import { inferNameFromIdentifier } from "../../../../../helpers/utils.mjs";

/**
 * Equipment panel part.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
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
            icon: TERIOCK.options.equipment.powerLevel[this.powerLevel].icon,
            label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label"),
            wrappers: [
              TERIOCK.options.equipment.powerLevel[this.powerLevel].label,
              inferNameFromIdentifier(this.equipmentType, "equipment"),
              this.range.description,
              ...simplifyTags(this._armamentTags),
            ],
          },
          this._attackBar,
          this._defenseBar,
          {
            icon: TERIOCK.display.icons.equipment.equipmentClasses,
            label: _loc(
              "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
            ),
            wrappers: [...simplifyTags(this._equipmentClassesTags)],
          },
          {
            icon: TERIOCK.display.icons.armament.load,
            label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.load"),
            wrappers: [
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", {
                value: this.weight.value,
              }),
              _loc("TERIOCK.SYSTEMS.Equipment.PANELS.minStr", {
                value: this.minStr.value,
              }),
              formulaExists(this.tier.text)
                ? _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
                    value: this.tier.text,
                  })
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
                    value: this.storage.carriedCount,
                    max: this.storage.maxCount.value,
                  }),
                  _loc("TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeight", {
                    value: this.storage.carriedWeight,
                    max: this.storage.maxWeight.value,
                  }),
                  _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weightMultiplier", {
                    value: this.storage.weightMultiplier,
                  }),
                ]
              : [],
          },
        ];
        return {
          ...(await super.getPanelParts()),
          bars,
        };
      }
    }
  );
};
