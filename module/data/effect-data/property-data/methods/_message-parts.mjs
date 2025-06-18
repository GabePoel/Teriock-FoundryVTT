/** @import { MessageParts } from "../../../../types/message-parts" */
/** @import TeriockPropertyData from "../property-data.mjs"; */

/**
 * @param {TeriockPropertyData} propertyData 
 * @returns {Partial<MessageParts>}
 */
export function _messageParts(propertyData) {
  const ref = CONFIG.TERIOCK.abilityOptions;
  const blocks = [
    {
      title: 'Description',
      text: propertyData.description,
    },
  ]
  return {
    bars: [
      {
        icon: 'fa-' + ref.abilityType[propertyData.propertyType].icon,
        wrappers: [
          ref.abilityType[propertyData.propertyType].name,
        ],
      }
    ],
    blocks: blocks,
  }
}