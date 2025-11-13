import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a resource effect, including blocks for display.
 * Creates formatted display elements for resource description.
 * @param {TeriockResourceModel} resourceData - The resource data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing blocks for the resource message.
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
    icon: documentOptions.resource.icon,
    label: documentOptions.resource.name,
  };
}
