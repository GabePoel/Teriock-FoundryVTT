import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting power types within a power item.
 * Generates options for all available power types from the configuration.
 * @param {TeriockPower} power - The power item to create the context menu for.
 * @returns {Array} Array of context menu options for power type selection.
 */
export function powerContextMenu(power) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let types = CONFIG.TERIOCK.powerOptions;
  for (const type in types) {
    const typeName = types[type].name;
    const typeIcon = types[type].icon;
    const icon = makeIcon(typeIcon, iconStyle);
    const option = {
      name: typeName,
      icon: icon,
      callback: () => {
        power.update({
          system: {
            type: type,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}
