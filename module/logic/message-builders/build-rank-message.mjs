import { addAbilitiesBlock } from "./message-parts.mjs";

export function buildRankMessage(rank) {
  const ref = CONFIG.TERIOCK.rankOptions;
  const src = rank.system;
  const bars = [
    {
      icon: 'fa-' + ref[src.archetype].classes[src.className].icon,
      wrappers: [
        ref[src.archetype].name,
        ref[src.archetype].classes[src.className].name,
        'Rank ' + src.classRank,
      ],
    },
    {
      icon: 'fa-circle-info',
      wrappers: [
        src.hitDie + ' Hit Die',
        src.manaDie + ' Mana Die',
        src.maxAv + ' Max AV',
      ],
    },
  ]
  const blocks = [
    {
      title: 'Description',
      text: src.description,
    },
    {
      title: 'Flaws',
      text: src.flaws,
    }
  ]
  addAbilitiesBlock(rank.transferredEffects, blocks);
  return {
    bars: bars,
    blocks: blocks,
  }
}