import { addAbilitiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";
import { secondsToReadable } from "../../../../helpers/utils.mjs";

/**
 * Generates message parts for a consequence effect, including bars and blocks for display.
 * Creates formatted display elements for tradecraft information and description.
 *
 * @param {TeriockConsequenceData} consequenceData - The fluency data to generate message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing bars and blocks for the fluency message.
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
      wrappers: Array.from(
        consequenceData.parent.statuses.map(
          (status) => CONFIG.TERIOCK.content.conditions[status].name,
        ),
      ),
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: consequenceData.parent.description,
    },
    {
      title: "Source Description",
      text: consequenceData.sourceDescription,
    },
  ];
  addAbilitiesBlock(consequenceData.parent.subs, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}
