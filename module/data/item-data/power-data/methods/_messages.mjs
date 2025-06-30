/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockPowerData from "../power-data.mjs"; */
import { addAbilitiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * @param {TeriockPowerData} powerData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _messageParts(powerData) {
  const ref = CONFIG.TERIOCK.powerOptions;
  const src = powerData;
  const bars = [
    {
      icon: "fa-" + ref[src.type].icon,
      label: "Power Type",
      wrappers: [ref[src.type].name],
    },
  ];
  if (powerData.type == "species") {
    bars.push({
      icon: "fa-user",
      wrappers: [
        powerData.size ? "Size " + powerData.size : "",
        powerData.adult ? "Adult at " + powerData.adult : "",
        powerData.lifespan ? powerData.lifespan + " Year Lifespan" : "Infinite Lifespan",
      ],
    });
  }
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
    {
      title: "Other Flaws",
      text: src.flaws,
    },
  ];
  addAbilitiesBlock(powerData.parent.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}
