// noinspection JSValidateTypes

import { getRollIcon, makeIcon } from "../../../../helpers/utils.mjs";

/**
 * Context menu entries.
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 * @private
 */
export function _entries(equipmentData) {
  return [
    {
      name: "Use in Two Hands",
      icon: makeIcon(
        getRollIcon(equipmentData.damage.twoHanded.value),
        "contextMenu",
      ),
      callback: equipmentData.roll.bind(equipmentData, { twoHanded: true }),
      condition:
        equipmentData.parent.isOwner &&
        equipmentData.damage.twoHanded.value !==
          equipmentData.damage.base.value,
      group: "usage",
    },
    {
      name: "Identify",
      icon: makeIcon("eye", "contextMenu"),
      callback: equipmentData.identify.bind(equipmentData),
      condition: !equipmentData.identification.identified,
      group: "usage",
    },
    {
      name: "Read Magic",
      icon: makeIcon("hand", "contextMenu"),
      callback: equipmentData.readMagic.bind(equipmentData),
      condition:
        equipmentData.parent.isOwner &&
        !equipmentData.identification.identified &&
        !equipmentData.identification.read,
      group: "usage",
    },
    {
      name: "Equip",
      icon: makeIcon("check", "contextMenu"),
      callback: equipmentData.equip.bind(equipmentData),
      condition: equipmentData.canEquip,
      group: "control",
    },
    {
      name: "Unequip",
      icon: makeIcon("xmark", "contextMenu"),
      callback: equipmentData.unequip.bind(equipmentData),
      condition: equipmentData.parent.isOwner && equipmentData.canUnequip,
      group: "control",
    },
    {
      name: "Glue",
      icon: makeIcon("link", "contextMenu"),
      callback: equipmentData.glue.bind(equipmentData),
      condition: equipmentData.parent.isOwner && !equipmentData.glued,
      group: "control",
    },
    {
      name: "Unglue",
      icon: makeIcon("link-slash", "contextMenu"),
      callback: equipmentData.unglue.bind(equipmentData),
      condition: equipmentData.parent.isOwner && equipmentData.glued,
      group: "control",
    },
    {
      name: "Shatter",
      icon: makeIcon("wine-glass-crack", "contextMenu"),
      callback: equipmentData.shatter.bind(equipmentData),
      condition: equipmentData.parent.isOwner && !equipmentData.shattered,
      group: "control",
    },
    {
      name: "Repair",
      icon: makeIcon("wine-glass", "contextMenu"),
      callback: equipmentData.repair.bind(equipmentData),
      condition: equipmentData.parent.isOwner && equipmentData.shattered,
      group: "control",
    },
    {
      name: "Dampen",
      icon: makeIcon("bell-slash", "contextMenu"),
      callback: equipmentData.dampen.bind(equipmentData),
      condition: equipmentData.parent.isOwner && !equipmentData.dampened,
      group: "control",
    },
    {
      name: "Undampen",
      icon: makeIcon("bell", "contextMenu"),
      callback: equipmentData.undampen.bind(equipmentData),
      condition: equipmentData.parent.isOwner && equipmentData.dampened,
      group: "control",
    },
    {
      name: "Unidentify",
      icon: makeIcon("eye-slash", "contextMenu"),
      callback: equipmentData.unidentify.bind(equipmentData),
      condition:
        equipmentData.parent.isOwner &&
        equipmentData.identification.identified &&
        game.user.isGM,
      group: "usage",
    },
  ];
}
