/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockResourceData from "../resource-data.mjs"; */

/**
 * @param {TeriockResourceData} resourceData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _messageParts(resourceData) {
  const blocks = [
    {
      title: "Description",
      text: resourceData.description,
    },
  ];
  return {
    bars: [],
    blocks: blocks,
  };
}
