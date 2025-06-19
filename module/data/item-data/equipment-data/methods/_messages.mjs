/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
import {
  addAbilitiesBlock,
  addPropertiesBlock,
  addResourcesBlock,
} from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _messageParts(equipmentData) {
  const ref = CONFIG.TERIOCK.equipmentOptions;
  const src = equipmentData;
  let damageString = "";
  if (src.damage) {
    damageString += src.damage;
    if (src.twoHandedDamage != 0) {
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
      wrappers: [ref.powerLevel[src.powerLevel].name, src.shattered ? "Shattered" : "", src.equipmentType],
    },
    {
      icon: "fa-crosshairs-simple",
      wrappers: [damageString, rangeString, src.sb, src.av, src.bv],
    },
    {
      icon: "fa-weight-hanging",
      wrappers: [src.weight + " lb", src.minStr + " min STR", src.tier ? "Tier " + src.tier : ""],
    },
    {
      icon: "fa-flag",
      wrappers: [...src.equipmentClasses.map((equipmentClass) => ref.equipmentClasses[equipmentClass])],
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
      title: "Mana storing",
      text: src.manaStoring,
    },
    {
      title: "Flaws",
      text: src.flaws,
    },
    {
      title: "Item tier",
      text: src.fllTier,
    },
  ];
  addPropertiesBlock(equipmentData.parent.transferredEffects, blocks);
  addAbilitiesBlock(equipmentData.parent.transferredEffects, blocks);
  addResourcesBlock(equipmentData.parent.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _secretMessageParts(equipmentData) {
  const src = equipmentData;
  let damageString = "";
  if (src.damage) {
    damageString += src.damage;
    if (src.twoHandedDamage != 0) {
      damageString += " / " + src.twoHandedDamage;
    }
    damageString += " damage";
  }
  const bars = [];
  const blocks = [
    {
      title: "Noticeable properties",
      text: src.noticeableProperties,
    },
  ];
  return {
    name: equipmentData.equipmentType,
    bars: bars,
    blocks: blocks,
  };
}
