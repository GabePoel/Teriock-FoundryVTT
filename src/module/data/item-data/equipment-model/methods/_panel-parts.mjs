import { prefix, suffix } from "../../../../helpers/string.mjs";

/**
 * Generates message parts for a piece of equipment.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing bars and blocks for the equipment message.
 * @private
 */
export function _panelParts(equipmentData) {
  const ref = TERIOCK.options.equipment;
  const src = equipmentData;
  const damageString = suffix(src.damage.base.text, "damage");
  const twoHandedDamageString = src.hasTwoHandedAttack
    ? suffix(src.damage.twoHanded.text, "damage")
    : "";
  let rangeString = "";
  if (src.range.long.nonZero) {
    rangeString += src.range.long.formula;
    if (src.range.short.nonZero) {
      rangeString = src.range.short.formula + " / " + rangeString;
    }
    rangeString += " ft";
  }
  const bars = [
    {
      icon: "fa-" + ref.powerLevel[src.powerLevel].icon,
      label: "Equipment Type",
      wrappers: [
        ref.powerLevel[src.powerLevel].name,
        src.shattered ? "Shattered" : "",
        src.equipmentType,
        rangeString,
      ],
    },
    {
      icon: "fa-crosshairs-simple",
      label: "Attack",
      wrappers: [
        damageString,
        twoHandedDamageString,
        src.hit.value ? `+${src.hit.value} Hit Bonus` : "",
        equipmentData.attackPenalty.nonZero
          ? equipmentData.attackPenalty.formula + " AP"
          : "",
        TERIOCK.index.weaponFightingStyles[src.fightingStyle],
      ],
    },
    {
      icon: "fa-shield",
      label: "Defense",
      wrappers: [
        src.av.value ? `${src.av.value} AV` : "",
        src.bv.value ? `${src.bv.value} BV` : "",
      ],
    },
    {
      icon: "fa-trophy",
      label: "Load",
      wrappers: [
        src.weight.value + " lb",
        src.minStr.value + " min STR",
        prefix(src.tier.text, "Tier"),
      ],
    },
    {
      icon: "fa-flag",
      label: "Equipment Classes",
      wrappers: [
        ...src.equipmentClasses.map((ec) => ref.equipmentClasses[ec]),
        src.spellTurning ? "Spell Turning" : "",
      ],
    },
  ];
  return {
    bars: bars,
  };
}
