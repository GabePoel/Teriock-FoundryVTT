import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates context menu entries for selecting a rank's archetype.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 */
export function archetypeContextMenu(rank) {
  const options = [];
  for (const [aKey, aData] of Object.entries(TERIOCK.options.rank)) {
    const firstClass = Object.keys(aData.classes)[0];
    const option = {
      name: aData.name,
      icon: makeIcon(aData.icon, "contextMenu"),
      callback: async () => {
        await rank.update({
          system: {
            archetype: aKey,
            className: firstClass,
            "statDice.hp.faces": aData.hp,
            "statDice.mp.faces": aData.mp,
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
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 */
export function classContextMenu(rank) {
  const options = [];
  for (const [aKey, aData] of Object.entries(TERIOCK.options.rank)) {
    for (const [cKey, cData] of Object.entries(aData.classes)) {
      const option = {
        name: cData.name,
        icon: makeIcon(cData.icon, "contextMenu"),
        callback: async () => {
          await rank.update({
            system: {
              className: cKey,
              archetype: aKey,
            },
          });
        },
        condition: () => {
          return foundry.utils.getProperty(rank.system, "archetype") === aKey;
        },
      };
      options.push(option);
    }
  }
  return options;
}

/**
 * Creates context menu entries for selecting a rank's number.
 * Generates options for ranks 0 through 9.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 */
export function rankContextMenu(rank) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  for (let i = 0; i <= 9; i++) {
    options.push({
      name: `Rank ${i}`,
      icon: makeIcon(`${i}`, iconStyle),
      callback: () => rank.update({ "system.classRank": i }),
    });
  }
  return options;
}
