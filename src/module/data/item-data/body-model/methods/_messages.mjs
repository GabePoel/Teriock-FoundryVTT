import { formulaExists } from "../../../../helpers/string.mjs";

/**
 * Generates message parts for a body part.
 * @param {TeriockBodyModel} bodyData
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing bars and blocks for the body part message.
 * @private
 */
export function _messageParts(bodyData) {
  const bars = [
    {
      icon: "fa-crosshairs-simple",
      label: "Attack",
      wrappers: [
        bodyData.damage.base.value +
          (bodyData.damage.base.value ? " damage" : ""),
        formulaExists(bodyData.attackPenalty.raw)
          ? bodyData.attackPenalty.raw + " AP"
          : "",
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
  return {
    bars: bars,
  };
}
