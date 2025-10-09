import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { secondsToReadable } from "../../../../helpers/utils.mjs";

/**
 * Generates message parts for a consequence effect, including bars and blocks for display.
 * Creates formatted display elements for tradecraft information and description.
 * @param {TeriockConsequenceModel} consequenceData - The fluency data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing bars and blocks for the fluency message.
 * @private
 */
export function _messageParts(consequenceData) {
  const bars = [
    {
      icon: "fa-hourglass",
      label: "Duration",
      /** @type string[] */
      wrappers: [
        !consequenceData.parent.isTemporary
          ? "No Time Limit"
          : secondsToReadable(
              consequenceData.parent.duration.startTime +
                consequenceData.parent.duration.seconds -
                consequenceData.parent.duration._worldTime,
            ) + " Remaining",
      ],
    },
    {
      icon: "fa-disease",
      label: "Conditions",
      /** @type string[] */
      wrappers: [
        ...Array.from(
          consequenceData.parent.statuses.map(
            (status) => TERIOCK.index.conditions[status],
          ),
        ),
        consequenceData.critical ? "Critical" : "",
        consequenceData.heightened
          ? `Heightened ${consequenceData.heightened} Time${
              consequenceData.heightened === 1 ? "" : "s"
            }`
          : "",
      ],
    },
  ];
  return {
    associations: consequenceData.associations,
    bars: bars,
    blocks: consequenceData.blocks,
    icon: documentOptions.consequence.icon,
    label: documentOptions.consequence.name,
  };
}
