import { formulaExists } from "../../../../../helpers/formula.mjs";

/**
 * Equipment panel part.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EquipmentSystem}
     * @mixin
     */
    class EquipmentPanelPart extends Base {
      /** @inheritdoc */
      get _damageWrappers() {
        const wrappers = super._damageWrappers;
        if (this.hasTwoHandedAttack) {
          const twoHandedDamageString = formulaExists(
            this.damage.twoHanded.typed,
          )
            ? game.i18n.format("TERIOCK.SYSTEMS.Armament.PANELS.damage", {
                value: this.damage.twoHanded.typed,
              })
            : "";
          wrappers.push(twoHandedDamageString);
        }
        return wrappers;
      }

      /** @inheritDoc */
      get panelParts() {
        const bars = [
          {
            icon: TERIOCK.options.equipment.powerLevel[this.powerLevel].icon,
            label: game.i18n.localize(
              "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
            ),
            wrappers: [
              TERIOCK.options.equipment.powerLevel[this.powerLevel].name,
              this.shattered
                ? game.i18n.format(
                    "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
                  )
                : "",
              this.equipmentType,
              this.range.description,
            ],
          },
          this._attackBar,
          this._defenseBar,
          {
            icon: TERIOCK.display.icons.armament.load,
            label: game.i18n.localize("TERIOCK.SYSTEMS.Armament.PANELS.load"),
            wrappers: [
              game.i18n.format("TERIOCK.SYSTEMS.Equipment.PANELS.weight", {
                value: this.weight.value,
              }),
              game.i18n.format("TERIOCK.SYSTEMS.Equipment.PANELS.minStr", {
                value: this.minStr.value,
              }),
              formulaExists(this.tier.text)
                ? game.i18n.format("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
                    value: this.tier.text,
                  })
                : "",
            ],
          },
          {
            icon: TERIOCK.display.icons.equipment.equipmentClasses,
            label: game.i18n.format(
              "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
            ),
            wrappers: [
              ...this.equipmentClasses.map(
                (ec) => TERIOCK.options.equipment.equipmentClasses[ec],
              ),
              this.spellTurning
                ? game.i18n.format(
                    "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
                  )
                : "",
            ],
          },
          {
            icon: TERIOCK.display.icons.equipment.storage,
            label: "Storage",
            wrappers: this.storage.enabled
              ? [
                  game.i18n.format(
                    "TERIOCK.SYSTEMS.Equipment.PANELS.carriedCount",
                    {
                      value: this.storage.carriedCount,
                      max: this.storage.maxCount.value,
                    },
                  ),
                  game.i18n.format(
                    "TERIOCK.SYSTEMS.Equipment.PANELS.carriedWeight",
                    {
                      value: this.storage.carriedWeight,
                      max: this.storage.maxWeight.value,
                    },
                  ),
                  game.i18n.format(
                    "TERIOCK.SYSTEMS.Equipment.PANELS.weightMultiplier",
                    { value: this.storage.weightMultiplier },
                  ),
                ]
              : [],
          },
        ];
        return {
          ...super.panelParts,
          bars,
        };
      }
    }
  );
};
