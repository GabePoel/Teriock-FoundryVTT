/** @import { MessageParts } from "../../../../types/message-parts" */
/** @import TeriockResourceData from "../resource-data.mjs"; */

/**
 * @param {TeriockResourceData} resourceData 
 * @returns {Partial<MessageParts>}
 */
export function _messageParts(resourceData) {
  const blocks = [
    {
      title: 'Description',
      text: resourceData.description,
    },
  ]
  return {
    bars: [],
    blocks: blocks,
  }
}