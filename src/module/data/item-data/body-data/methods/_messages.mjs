import { addPropertiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a body part.
 * @param {TeriockBodyModel} bodyData
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the body part message.
 * @private
 */
export function _messageParts(bodyData) {
  const bars = [
    {
      icon: "fa-crosshairs-simple",
      label: "Attack",
      wrappers: [
        bodyData.damage.base.value,
        TERIOCK.index.weaponFightingStyles[bodyData.fightingStyle],
      ],
    },
    {
      icon: "fa-shield",
      label: "Defense",
      wrappers: [
        bodyData.av.value ? `${bodyData.av.value} AV` : "",
        bodyData.bv.value ? `${bodyData.bv.value} BV` : "",
      ],
    },
    {
      icon: "fa-flag",
      label: "Equipment Classes",
      wrappers: [
        "Body parts",
        bodyData.av.value ? "Armor" : "",
        bodyData.spellTurning ? "Spell Turning" : "",
      ],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: bodyData.description,
    },
    {
      title: "Notes",
      text: bodyData.notes,
    },
  ];
  if (bodyData.fightingStyle && bodyData.fightingStyle.length > 0) {
    blocks.push({
      title:
        TERIOCK.index.weaponFightingStyles[bodyData.fightingStyle] +
        " Fighting Style",
      text: bodyData.specialRules,
    });
  }
  addPropertiesBlock(
    bodyData.parent.transferredEffects.filter((e) => !e.sup),
    blocks,
  );
  return {
    bars: bars,
    blocks: blocks,
  };
}
