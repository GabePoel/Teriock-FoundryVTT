import { makeIcon } from "../../../../helpers/utils.mjs";

export function callbackContextMenu(resource) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  const functionHooks = CONFIG.TERIOCK.resourceOptions.functionHooks;
  for (const hook in functionHooks) {
    const hookName = functionHooks[hook].name;
    const hookIcon = functionHooks[hook].icon;
    const icon = makeIcon(hookIcon, iconStyle);
    const option = {
      name: hookName,
      icon: icon,
      callback: () => {
        resource.update({
          'system.functionHook': hook,
        });
      },
    };
    options.push(option);
  }
  return options;
}