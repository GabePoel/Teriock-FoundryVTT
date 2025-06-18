/** @import { MessageParts } from "../../../../types/message-parts" */
/** @import TeriockFluencyData from "../fluency-data.mjs"; */

/**
 * @param {TeriockFluencyData} fluencyData 
 * @returns {Partial<MessageParts>}
 */
export function _messageParts(fluencyData) {
  const ref = CONFIG.TERIOCK.tradecraftOptions;
  const src = fluencyData;
  const bars = [
    {
      icon: 'fa-' + ref[src.field].tradecrafts[src.tradecraft].icon,
      wrappers: [
        ref[src.field].name,
        ref[src.field].tradecrafts[src.tradecraft].name,
      ],
    }
  ]
  const blocks = [
    {
      title: 'Description',
      text: src.description,
    },
  ]
  return {
    bars: bars,
    blocks: blocks,
  }
}