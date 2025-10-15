import { documentOptions } from "../../../../constants/options/document-options.mjs";

/**
 * Generates message parts for a rank item, including bars and blocks for display.
 * Creates formatted display elements for archetype, class information, dice, and description.
 * @param {TeriockRankModel} rankData - The rank item to generate message parts for.
 * @returns {object} Object containing bars and blocks for the rank message.
 * @private
 */
export function _messageParts(rankData) {
  const ref = TERIOCK.options.rank;
  const src = rankData;
  const bars = [
    {
      icon: "fa-" + ref[src.archetype].classes[src.className].icon,
      label: "Class",
      wrappers: [
        ref[src.archetype].name,
        ref[src.archetype].classes[src.className].name,
        "Rank " + src.classRank,
      ],
    },
    {
      icon: "fa-dice",
      label: "Stat Dice",
      wrappers: [
        rankData.statDice.hp.formula + " Hit Dice",
        rankData.statDice.mp.formula + " Mana Dice",
      ],
    },
    {
      icon: "fa-helmet-battle",
      label: "Details",
      wrappers: [
        rankData.maxAv === 0 ? "No Armor" : rankData.maxAv + " Max AV",
        rankData.innate ? "Innate" : "Learned",
      ],
    },
  ];
  const blocks = [
    {
      title: "Description",
      text: src.description,
    },
    {
      title: "Flaws",
      text: src.flaws,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
    icon: documentOptions.rank.icon,
    label: documentOptions.rank.name,
  };
}
