import { getRollIcon, makeIcon } from "../../../../helpers/utils.mjs";

/**
 * Context menu entries.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 * @private
 */
export function _entries(equipmentData) {
  return [
    {
      name: "Use in Two Hands",
      icon: makeIcon(
        getRollIcon(equipmentData.derivedTwoHandedDamage),
        "contextMenu",
      ),
      callback: equipmentData.roll.bind(equipmentData, { twoHanded: true }),
      condition:
        equipmentData.derivedTwoHandedDamage !== equipmentData.derivedDamage,
      group: "usage",
    },
    {
      name: "Identify",
      icon: makeIcon("eye", "contextMenu"),
      callback: equipmentData.identify.bind(equipmentData),
      condition: !equipmentData.identified && equipmentData.reference,
      group: "usage",
    },
    {
      name: "Read Magic",
      icon: makeIcon("hand", "contextMenu"),
      callback: equipmentData.readMagic.bind(equipmentData),
      condition:
        !equipmentData.identified &&
        equipmentData.reference &&
        equipmentData.powerLevel === "unknown",
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
      condition: equipmentData.canUnequip,
      group: "control",
    },
    {
      name: "Attune",
      icon: makeIcon("handshake-simple", "contextMenu"),
      callback: equipmentData.attune.bind(equipmentData),
      condition: !equipmentData.isAttuned,
      group: "control",
    },
    {
      name: "Deattune",
      icon: makeIcon("handshake-simple-slash", "contextMenu"),
      callback: equipmentData.deattune.bind(equipmentData),
      condition: equipmentData.isAttuned,
      group: "control",
    },
    {
      name: "Glue",
      icon: makeIcon("link", "contextMenu"),
      callback: equipmentData.glue.bind(equipmentData),
      condition: !equipmentData.glued,
      group: "control",
    },
    {
      name: "Unglue",
      icon: makeIcon("link-slash", "contextMenu"),
      callback: equipmentData.unglue.bind(equipmentData),
      condition: equipmentData.glued,
      group: "control",
    },
    {
      name: "Shatter",
      icon: makeIcon("wine-glass-crack", "contextMenu"),
      callback: equipmentData.shatter.bind(equipmentData),
      condition: !equipmentData.shattered,
      group: "control",
    },
    {
      name: "Repair",
      icon: makeIcon("wine-glass", "contextMenu"),
      callback: equipmentData.repair.bind(equipmentData),
      condition: equipmentData.shattered,
      group: "control",
    },
    {
      name: "Dampen",
      icon: makeIcon("bell-slash", "contextMenu"),
      callback: equipmentData.dampen.bind(equipmentData),
      condition: !equipmentData.dampened,
      group: "control",
    },
    {
      name: "Undampen",
      icon: makeIcon("bell", "contextMenu"),
      callback: equipmentData.undampen.bind(equipmentData),
      condition: equipmentData.dampened,
      group: "control",
    },
    {
      name: "Make Unidentified Copy",
      icon: makeIcon("eye-slash", "contextMenu"),
      callback: equipmentData.unidentify.bind(equipmentData),
      condition: equipmentData.identified && game.user.isGM,
      group: "usage",
    },
  ];
}
