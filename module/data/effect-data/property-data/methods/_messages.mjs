/** @import { MessageParts } from "../../../../types/messages" */
/** @import TeriockPropertyData from "../property-data.mjs"; */

/**
 * @param {TeriockPropertyData} propertyData
 * @returns {Partial<MessageParts>}
 * @private
 */
export function _messageParts(propertyData) {
  const ref = CONFIG.TERIOCK.abilityOptions;
  const blocks = [
    {
      title: "Description",
      text: propertyData.description,
    },
  ];
  return {
    bars: [
      {
        icon: "fa-" + ref.abilityType[propertyData.propertyType].icon,
        label: "Property Type",
        wrappers: [ref.abilityType[propertyData.propertyType].name],
      },
    ],
    blocks: blocks,
  };
}
