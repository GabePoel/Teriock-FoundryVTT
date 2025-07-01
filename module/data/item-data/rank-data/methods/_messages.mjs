import { addAbilitiesBlock } from "../../../../helpers/messages-builder/message-parts.mjs";

/**
 * Generates message parts for a rank item, including bars and blocks for display.
 * Creates formatted display elements for archetype, class information, dice, and description.
 * @param {TeriockRank} rank - The rank item to generate message parts for.
 * @returns {object} Object containing bars and blocks for the rank message.
 * @private
 */
export function _messageParts(rank) {
  const ref = CONFIG.TERIOCK.rankOptions;
  const src = rank.system;
  const bars = [
    {
      icon: "fa-" + ref[src.archetype].classes[src.className].icon,
      label: "Archetype",
      wrappers: [ref[src.archetype].name, ref[src.archetype].classes[src.className].name, "Rank " + src.classRank],
    },
    {
      icon: "fa-circle-info",
      label: "Dice",
      wrappers: [src.hitDie + " Hit Die", src.manaDie + " Mana Die", src.maxAv + " Max AV"],
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
  addAbilitiesBlock(rank.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  };
}
