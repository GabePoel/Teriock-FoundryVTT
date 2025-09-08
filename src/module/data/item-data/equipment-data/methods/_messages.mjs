import {
  addAbilitiesBlock,
  addFluenciesBlock,
  addPropertiesBlock,
  addResourcesBlock,
} from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a piece of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the equipment message.
 * @private
 */
export function _messageParts(equipmentData) {
  const ref = TERIOCK.options.equipment;
  const src = equipmentData;
  let damageString = "";
  if (src.derivedDamage) {
    damageString += src.derivedDamage;
    if (src.twoHandedDamage !== "0") {
      damageString += " / " + src.derivedTwoHandedDamage;
    }
  }
  let rangeString = "";
  if (src.range) {
    rangeString += src.range;
    if (src.shortRange) {
      rangeString = src.shortRange + " / " + rangeString;
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
      wrappers: [damageString, rangeString, src.sb],
    },
    {
      icon: "fa-shield",
      label: "Defense",
      wrappers: [
        src.derivedAv ? `${src.derivedAv} AV` : "",
        src.derivedBv ? `${src.derivedBv} BV` : "",
      ],
    },
    {
      icon: "fa-weight-hanging",
      label: "Load",
      wrappers: [
        src.weight + " lb",
        src.minStr + " min STR",
        src.tier.raw ? "Tier " + src.tier.raw : "",
      ],
    },
    {
      icon: "fa-flag",
      label: "Equipment Classes",
      wrappers: [...src.equipmentClasses.map((ec) => ref.equipmentClasses[ec])],
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
  if (equipmentData.sb && equipmentData.sb.length > 0) {
    blocks.push({
      title:
        TERIOCK.index.weaponFightingStyles[equipmentData.sb] +
        " Fighting Style",
      text: equipmentData.specialRules,
    });
  }
  addPropertiesBlock(
    equipmentData.parent.transferredEffects.filter((e) => !e.sup),
    blocks,
  );
  addAbilitiesBlock(
    equipmentData.parent.transferredEffects.filter((e) => !e.sup),
    blocks,
  );
  addResourcesBlock(equipmentData.parent.transferredEffects, blocks);
  addFluenciesBlock(equipmentData.parent.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}

/**
 * Generates secret message parts for an equipment item, showing only noticeable properties.
 * Used when equipment is not fully identified.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to generate secret message parts for.
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the secret equipment
 *   message.
 * @private
 */
export function _secretMessageParts(equipmentData) {
  const bars = [];
  const blocks = [
    {
      title: "Noticeable properties",
    },
  ];
  return {
    name: equipmentData.equipmentType,
    bars: bars,
    blocks: blocks,
  };
}
