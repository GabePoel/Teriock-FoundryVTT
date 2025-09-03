import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting property types within a property effect.
 * Generates options for all available ability types that can be used as properties.
 * @param {TeriockProperty} property - The property effect to create the context menu for.
 * @returns {Array} Array of context menu options for property type selection.
 */
export function propertyContextMenu(property) {
  const iconStyle = CONFIG.TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let types = CONFIG.TERIOCK.options.ability.form;
  for (const type in types) {
    const typeName = types[type].name;
    const typeIcon = types[type].icon;
    const icon = makeIcon(typeIcon, iconStyle);
    const option = {
      name: typeName,
      icon: icon,
      callback: async () => {
        await property.update({
          system: {
            form: type,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}
