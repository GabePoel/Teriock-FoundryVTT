import { addAbilitiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a power item, including bars and blocks for display.
 * Creates formatted display elements for power type, species information, description, and flaws.
 * @param {TeriockPowerData} powerData - The power data to generate message parts for.
 * @returns {Partial<MessageParts>} Object containing bars and blocks for the power message.
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
