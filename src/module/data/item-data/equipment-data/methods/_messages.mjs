import { documentOptions } from "../../../../constants/options/document-options.mjs";

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
  if (src.damage.base.value) {
    damageString += src.damage.base.value;
  }
  if (src.hasTwoHandedAttack) {
    twoHandedDamageString = src.damage.twoHanded.value;
  }
  let rangeString = "";
  if (src.range.long.raw) {
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
      ],
    },
    {
      icon: "fa-crosshairs-simple",
      label: "Attack",
      wrappers: [
        damageString,
        twoHandedDamageString,
        rangeString,
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
      icon: "fa-weight-hanging",
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
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
    {
      title: "Notes",
      text: src.notes,
    },
    {
      title: "Flaws",
      text: src.flaws,
    },
  ];
  if (equipmentData.fightingStyle && equipmentData.fightingStyle.length > 0) {
    blocks.push({
      title:
        TERIOCK.index.weaponFightingStyles[equipmentData.fightingStyle] +
        " Fighting Style",
      text: equipmentData.specialRules,
    });
  }
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.equipment.icon,
    label: documentOptions.equipment.name,
  };
}
