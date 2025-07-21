/**
 * Generates message parts for a resource effect, including blocks for display.
 * Creates formatted display elements for resource description.
 *
 * @param {TeriockResourceData} resourceData - The resource data to generate message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing blocks for the resource message.
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
