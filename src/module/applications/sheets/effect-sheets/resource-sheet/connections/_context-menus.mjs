import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting function hooks within a resource effect.
 * Generates options for all available function hooks that can be used as callbacks.
 * @param {TeriockResource} resource - The resource effect to create the context menu for.
 * @returns {Array} Array of context menu options for function hook selection.
 */
export function callbackContextMenu(resource) {
  const iconStyle = CONFIG.TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  const functionHooks = CONFIG.TERIOCK.options.resource.functionHooks;
  for (const hook in functionHooks) {
    const hookName = functionHooks[hook].name;
    const hookIcon = functionHooks[hook].icon;
    const icon = makeIcon(hookIcon, iconStyle);
    const option = {
      name: hookName,
      icon: icon,
      callback: async () => {
        await resource.update({
          "system.functionHook": hook,
        });
      },
    };
    options.push(option);
  }
  return options;
}
