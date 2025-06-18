import { makeIcon } from "../../../../helpers/utils.mjs";

export function propertyContextMenu(property) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let types = CONFIG.TERIOCK.abilityOptions.abilityType;
  for (const type in types) {
    const typeName = types[type].name;
    const typeIcon = types[type].icon;
    const icon = makeIcon(typeIcon, iconStyle);
    const option = {
      name: typeName,
      icon: icon,
      callback: () => {
        property.update({
          'system': {
            'propertyType': type,
          }
        });
      }
    };
    options.push(option);
  }
  return options;
}