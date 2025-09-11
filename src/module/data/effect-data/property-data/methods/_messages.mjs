import { addPropertiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a property effect, including bars and blocks for display.
 * Creates formatted display elements for property type information and description.
 * @param {TeriockPropertyData} propertyData - The property data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the property message.
 * @private
 */
export function _messageParts(propertyData) {
  const ref = TERIOCK.options.ability;
  const blocks = [
    {
      title: "Description",
      text: propertyData.description,
    },
  ];
  if (!propertyData.parent.inCompendium) {
    addPropertiesBlock(propertyData.parent.subs, blocks);
  }
  return {
    bars: [
      {
        icon: "fa-" + ref.form[propertyData.form].icon,
        label: "Property Type",
        wrappers: [ ref.form[propertyData.form].name ],
      },
    ],
    blocks: blocks,
  };
}
