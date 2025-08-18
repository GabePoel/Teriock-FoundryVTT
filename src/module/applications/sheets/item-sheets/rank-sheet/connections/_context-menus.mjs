import { dieOptions } from "../../../../../constants/die-options.mjs";
import { getRollIcon, makeIcon, toTitleCase } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting archetypes within a rank item.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 *
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for archetype selection.
 */
export function archetypeContextMenu(rank) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let archetypes = CONFIG.TERIOCK.rankOptions;
  for (const archetype in archetypes) {
    const archetypeName = archetypes[archetype].name;
    const archetypeIcon = archetypes[archetype].icon;
    const icon = makeIcon(archetypeIcon, iconStyle);
    const firstClass = Object.keys(archetypes[archetype].classes)[0];
    const hpDiePath = rank.system.hpDie.path;
    const mpDiePath = rank.system.mpDie.path;
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
          system: { archetype: archetype, className: firstClass },
          [`${hpDiePath}.faces`]: hpFaces,
          [`${hpDiePath}.value`]: Math.ceil((hpFaces + 1) / 2),
          [`${mpDiePath}.faces`]: mpFaces,
          [`${mpDiePath}.value`]: Math.ceil((mpFaces + 1) / 2),
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
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let archetypes = CONFIG.TERIOCK.rankOptions;
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
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
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

/**
 * Creates a context menu for selecting dice types for hit points or mana points.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @param {string} stat - The stat to configure ("hp" or "mp").
 * @returns {Array} Array of context menu options for die selection.
 */
function dieContextMenu(rank, stat = "hp") {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const out = [];
  for (const [key, value] of Object.entries(dieOptions.faces)) {
    out.push({
      name: `${value} ${toTitleCase(dieOptions.stats[stat])} Die`,
      icon: makeIcon(getRollIcon(value), iconStyle),
      callback: () => rank.system.setDice(stat, 1, Number(key)),
    });
  }
  return out;
}

/**
 * Creates a context menu for selecting hit die types within a rank item.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for hit die selection.
 */
export function hpDieContextMenu(rank) {
  return dieContextMenu(rank, "hp");
}

/**
 * Creates a context menu for selecting mana die types within a rank item.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {Array} Array of context menu options for mana die selection.
 */
export function mpDieContextMenu(rank) {
  return dieContextMenu(rank, "mp");
}
