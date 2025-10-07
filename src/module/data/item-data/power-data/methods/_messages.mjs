import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a power item, including bars and blocks for display.
 * Creates formatted display elements for power type, species information, description, and flaws.
 * @param {TeriockPowerModel} powerData - The power data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessageParts>} Object containing bars and blocks for the power message.
 * @private
 */
export function _messageParts(powerData) {
  const ref = TERIOCK.options.power;
  const src = powerData;
  const bars = [
    {
      icon: "fa-" + ref[src.type].icon,
      label: "Power Type",
      wrappers: [ref[src.type].name],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
    {
      title: "Other Flaws",
      text: src.flaws,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.power.icon,
    label: documentOptions.power.name,
  };
}
