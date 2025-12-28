import { prefix, suffix } from "../../../../helpers/string.mjs";

/**
 * Equipment panel part.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     * @mixin
     */
    class EquipmentPanelPart extends Base {
      /** @inheritDoc */
      get panelParts() {
        const damageString = suffix(this.damage.base.typed, "damage");
        const twoHandedDamageString = this.hasTwoHandedAttack
          ? suffix(this.damage.twoHanded.typed, "damage")
          : "";
        let rangeString = "";
        if (this.range.long.nonZero) {
          rangeString += this.range.long.formula;
          if (this.range.short.nonZero) {
            rangeString = this.range.short.formula + " / " + rangeString;
          }
          rangeString += " ft";
        }
        const bars = [
          {
            icon:
              "fa-" +
              TERIOCK.options.equipment.powerLevel[this.powerLevel].icon,
            label: "Equipment Type",
            wrappers: [
              TERIOCK.options.equipment.powerLevel[this.powerLevel].name,
              this.shattered ? "Shattered" : "",
              this.equipmentType,
              rangeString,
            ],
          },
          {
            icon: "fa-crosshairs-simple",
            label: "Attack",
            wrappers: [
              damageString,
              twoHandedDamageString,
              this.hit.value ? `+${this.hit.value} Hit Bonus` : "",
              this.attackPenalty.nonZero
                ? this.attackPenalty.formula + " AP"
                : "",
              TERIOCK.index.weaponFightingStyles[this.fightingStyle],
            ],
          },
          {
            icon: "fa-shield",
            label: "Defense",
            wrappers: [
              this.av.value ? `${this.av.value} AV` : "",
              this.bv.value ? `${this.bv.value} BV` : "",
            ],
          },
          {
            icon: "fa-trophy",
            label: "Load",
            wrappers: [
              this.weight.value + " lb",
              this.minStr.value + " min STR",
              prefix(this.tier.text, "Tier"),
            ],
          },
          {
            icon: "fa-flag",
            label: "Equipment Classes",
            wrappers: [
              ...this.equipmentClasses.map(
                (ec) => TERIOCK.options.equipment.equipmentClasses[ec],
              ),
              this.spellTurning ? "Spell Turning" : "",
            ],
          },
          {
            icon: "fa-backpack",
            label: "Storage",
            wrappers: this.storage.enabled
              ? [
                  `${this.storage.carriedCount} / ${this.storage.maxCount.value} Items Carried`,
                  `${this.storage.carriedWeight} / ${this.storage.maxWeight.value} lb Carried`,
                  `× ${this.storage.weightMultiplier} Weight Multiplier`,
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
