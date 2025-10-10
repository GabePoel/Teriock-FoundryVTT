import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a mount.
 * @param {TeriockMountModel} mountData
 * @private
 */
export function _messageParts(mountData) {
  const bars = [
    {
      icon: "fa-dice",
      label: "Stat Dice",
      wrappers: [
        mountData.hpDiceFormula + " Hit Dice",
        mountData.mpDiceFormula + " Mana Dice",
      ],
    },
    {
      icon: "fa-trophy",
      label: "Load",
      wrappers: ["Tier " + mountData.tier.raw || "0", mountData.mountType],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: mountData.description,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.mount.icon,
    label: documentOptions.mount.name,
  };
}
