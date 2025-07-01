/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockFluencyData from "../fluency-data.mjs"; */

/**
 * Generates message parts for a fluency effect, including bars and blocks for display.
 * Creates formatted display elements for tradecraft information and description.
 * @param {TeriockFluencyData} fluencyData - The fluency data to generate message parts for.
 * @returns {Partial<MessageParts>} Object containing bars and blocks for the fluency message.
 * @private
 */
export function _messageParts(fluencyData) {
  const ref = CONFIG.TERIOCK.tradecraftOptions;
  const src = fluencyData;
  const bars = [
    {
      icon: "fa-" + ref[src.field].tradecrafts[src.tradecraft].icon,
      label: "Tradecraft",
      wrappers: [ref[src.field].name, ref[src.field].tradecrafts[src.tradecraft].name],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
  };
}
