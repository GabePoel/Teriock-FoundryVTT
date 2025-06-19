/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockFluencyData from "../fluency-data.mjs"; */

/**
 * @param {TeriockFluencyData} fluencyData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _messageParts(fluencyData) {
  const ref = CONFIG.TERIOCK.tradecraftOptions;
  const src = fluencyData;
  const bars = [
    {
      icon: "fa-" + ref[src.field].tradecrafts[src.tradecraft].icon,
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
