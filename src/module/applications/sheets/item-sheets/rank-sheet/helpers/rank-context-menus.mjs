import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates context menu entries for selecting a rank's archetype.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {ContextMenuEntry[]}
 */
export function archetypeContextMenu(rank) {
  const options = [];
  for (const [aKey, aData] of Object.entries(TERIOCK.config.class.archetypes)) {
    const firstClass = Object.keys(TERIOCK.config.class.classes).find(cKey =>
      TERIOCK.config.class.classes[cKey].archetype === aKey
    );
    const option = {
      icon: makeIcon(aData.icon, "contextMenu"),
      label: aData.label,
      onClick: async () => {
        await rank.update({
          system: {
            archetype: aKey,
            class: firstClass,
            "statDice.hp.formula": `1d${aData.stats.hp}`,
            "statDice.mp.formula": `1d${aData.stats.mp}`,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}

/**
 * Creates context menu entries for selecting a rank's class.
 * Generates options for all classes within the current archetype.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {ContextMenuEntry[]}
 */
export function classContextMenu(rank) {
  const options = [];
  for (const [cKey, cData] of Object.entries(TERIOCK.config.class.classes)) {
    const aKey = cData.archetype;
    const option = {
      icon: makeIcon(cData.icon, "contextMenu"),
      label: cData.label,
      onClick: async () => await rank.update({ system: { archetype: aKey, class: cKey } }),
      visible: () => foundry.utils.getProperty(rank.system, "archetype") === aKey,
    };
    options.push(option);
  }
  return options;
}
