import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a fluency effect, including bars and blocks for display.
 * Creates formatted display elements for tradecraft information and description.
 * @param {TeriockFluencyModel} fluencyData - The fluency data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the fluency message.
 * @private
 */
export function _messageParts(fluencyData) {
  const ref = TERIOCK.options.tradecraft;
  const src = fluencyData;
  const bars = [
    {
      icon: "fa-" + ref[src.field].tradecrafts[src.tradecraft].icon,
      label: "Tradecraft",
      /** @type string[] */
      wrappers: [
        ref[src.field].name,
        ref[src.field].tradecrafts[src.tradecraft].name,
      ],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
    {
      title: TERIOCK.index.tradecrafts[fluencyData.tradecraft],
      text: TERIOCK.content.tradecrafts[fluencyData.tradecraft],
      italic: true,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.fluency.icon,
    label: documentOptions.fluency.name,
  };
}
