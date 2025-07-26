import {
  addAbilitiesBlock,
  addPropertiesBlock,
  addResourcesBlock
} from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for an equipment item, including bars and blocks for display.
 * Creates formatted display elements for equipment type, damage, load, and equipment classes.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to generate message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing bars and blocks for the equipment message.
 * @private
 */
export function _messageParts(equipmentData) {
  const ref = CONFIG.TERIOCK.equipmentOptions;
  const src = equipmentData;
  let damageString = "";
  if (src.damage) {
    damageString += src.damage;
    if (src.twoHandedDamage !== "0") {
      damageString += " / " + src.twoHandedDamage;
    }
    damageString += " damage";
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
      label: "Damage",
      wrappers: [damageString, rangeString, src.sb, src.av, src.bv],
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
      wrappers: [
        ...src.equipmentClasses.map(
          (equipmentClass) => ref.equipmentClasses[equipmentClass],
        ),
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
      title: "Equipment type rules",
      text: src.specialRules,
    },
    {
      title: "Flaws",
      text: src.flaws,
    },
  ];
  addPropertiesBlock(equipmentData.parent.transferredEffects, blocks);
  addAbilitiesBlock(
    equipmentData.parent.transferredEffects.filter((e) => !e.sup),
    blocks,
  );
  addResourcesBlock(equipmentData.parent.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}

/**
 * Generates secret message parts for an equipment item, showing only noticeable properties.
 * Used when equipment is not fully identified.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to generate secret message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing bars and blocks for the secret equipment message.
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
