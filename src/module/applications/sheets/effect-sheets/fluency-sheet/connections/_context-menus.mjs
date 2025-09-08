import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting tradecrafts within a fluency effect.
 * Generates options for all tradecrafts within the current field.
 * @param {TeriockFluency} fluency - The fluency effect to create the context menu for.
 * @returns {Array} Array of context menu options for tradecraft selection.
 */
export function tradecraftContextMenu(fluency) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let fields = TERIOCK.options.tradecraft;
  for (const field in fields) {
    const tradecrafts = fields[field].tradecrafts;
    for (const tradecraft in tradecrafts) {
      const tradecraftName = tradecrafts[tradecraft].name;
      const tradecraftIcon = tradecrafts[tradecraft].icon;
      const icon = makeIcon(tradecraftIcon, iconStyle);
      const option = {
        name: tradecraftName,
        icon: icon,
        callback: async () => {
          const updateData = {
            system: {
              field: field,
              tradecraft: tradecraft,
            },
          };
          await fluency.update(updateData);
        },
        condition: () => {
          return foundry.utils.getProperty(fluency.system, "field") === field;
        },
      };
      options.push(option);
    }
  }
  return options;
}

/**
 * Creates a context menu for selecting fields within a fluency effect.
 * Generates options for all available fields and sets the first tradecraft as default.
 * @param {TeriockFluency} fluency - The fluency effect to create the context menu for.
 * @returns {Array} Array of context menu options for field selection.
 */
export function fieldContextMenu(fluency) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let fields = TERIOCK.options.tradecraft;
  for (const field in fields) {
    const fieldName = fields[field].name;
    const icon = makeIcon(fields[field].icon, iconStyle);
    const firstTradecraft = Object.keys(fields[field].tradecrafts)[0];
    const option = {
      name: fieldName,
      icon: icon,
      callback: async () => {
        const updateData = {
          system: {
            field: field,
            tradecraft: firstTradecraft,
          },
        };
        await fluency.update(updateData);
      },
    };
    options.push(option);
  }
  return options;
}
