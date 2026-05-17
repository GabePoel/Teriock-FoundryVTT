import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates context menu entries for selecting a rank's archetype.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {ContextMenuEntry[]}
 */
export function archetypeContextMenu(rank) {
  const options = [];
  for (const [aKey, aData] of Object.entries(TERIOCK.config.rank)) {
    const firstClass = Object.keys(aData.classes)[0];
    const option = {
      icon: makeIcon(aData.icon, "contextMenu"),
      label: aData.name,
      onClick: async () => {
        await rank.update({
          system: {
            archetype: aKey,
            className: firstClass,
            "statDice.hp.formula": `1d${aData.hp}`,
            "statDice.mp.formula": `1d${aData.mp}`,
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
  for (const [aKey, aData] of Object.entries(TERIOCK.config.rank)) {
    for (const [cKey, cData] of Object.entries(aData.classes)) {
      const option = {
        icon: makeIcon(cData.icon, "contextMenu"),
        label: cData.name,
        onClick: async () => {
          await rank.update({
            system: {
              archetype: aKey,
              className: cKey,
            },
          });
        },
        visible: () => {
          return foundry.utils.getProperty(rank.system, "archetype") === aKey;
        },
      };
      options.push(option);
    }
  }
  return options;
}
