import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting archetypes within a rank item.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 *
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for archetype selection.
 */
export function archetypeContextMenu(rank) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let archetypes = TERIOCK.options.rank;
  for (const archetype in archetypes) {
    const archetypeName = archetypes[archetype].name;
    const archetypeIcon = archetypes[archetype].icon;
    const icon = makeIcon(archetypeIcon, iconStyle);
    const firstClass = Object.keys(archetypes[archetype].classes)[0];
    let hpFaces = 10;
    let mpFaces = 10;
    if (archetype === "warrior") {
      hpFaces = 12;
      mpFaces = 8;
    }
    if (archetype === "mage") {
      hpFaces = 8;
      mpFaces = 12;
    }
    const option = {
      name: archetypeName,
      icon: icon,
      callback: async () => {
        await rank.update({
          system: {
            archetype: archetype,
            className: firstClass,
            "statDice.hp.faces": hpFaces,
            "statDice.mp.faces": mpFaces,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}

/**
 * Creates a context menu for selecting classes within a rank item.
 * Generates options for all classes within the current archetype.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for class selection.
 */
export function classContextMenu(rank) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let archetypes = TERIOCK.options.rank;
  for (const archetype in archetypes) {
    const classes = archetypes[archetype].classes;
    for (const className in classes) {
      const classIcon = classes[className].icon;
      const icon = makeIcon(classIcon, iconStyle);
      const option = {
        name: classes[className].name,
        icon: icon,
        callback: async () => {
          await rank.update({
            system: {
              className: className,
              archetype: archetype,
            },
          });
        },
        condition: () => {
          return (
            foundry.utils.getProperty(rank.system, "archetype") === archetype
          );
        },
      };
      options.push(option);
    }
  }
  return options;
}

/**
 * Creates a context menu for selecting ranks within a rank item.
 * Generates options for ranks 0 through 9.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for rank selection.
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
