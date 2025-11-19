import { formulaExists } from "../../../../helpers/string.mjs";

/**
 * Generates message parts for a piece of equipment.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing bars and blocks for the equipment message.
 * @private
 */
export function _messageParts(equipmentData) {
  const ref = TERIOCK.options.equipment;
  const src = equipmentData;
  let damageString = "";
  let twoHandedDamageString = "";
  if (formulaExists(src.damage.base.value)) {
    damageString += src.damage.base.value;
  }
  if (formulaExists(damageString)) {
    damageString += " damage";
  }
  if (src.hasTwoHandedAttack) {
    twoHandedDamageString = src.damage.twoHanded.value;
  }
  if (formulaExists(twoHandedDamageString)) {
    twoHandedDamageString += " damage";
  }
  let rangeString = "";
  if (formulaExists(src.range.long.raw)) {
    rangeString += src.range.long.raw;
    if (src.range.short.raw) {
      rangeString = src.range.short.raw + " / " + rangeString;
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
        formulaExists(equipmentData.attackPenalty.raw)
          ? equipmentData.attackPenalty.raw + " AP"
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
        src.tier.raw ? "Tier " + src.tier.raw : "",
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
