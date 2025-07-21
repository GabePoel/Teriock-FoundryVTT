/**
 * Generates message parts for a property effect, including bars and blocks for display.
 * Creates formatted display elements for property type information and description.
 *
 * @param {TeriockPropertyData} propertyData - The property data to generate message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing bars and blocks for the property message.
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
