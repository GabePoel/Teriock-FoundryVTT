import { makeIcon } from "../../../../helpers/utils.mjs";

export function tradecraftContextMenu(fluency) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let fields = CONFIG.TERIOCK.tradecraftOptions;
  for (const field in fields) {
    const tradecrafts = fields[field].tradecrafts;
    for (const tradecraft in tradecrafts) {
      const tradecraftName = tradecrafts[tradecraft].name;
      const tradecraftIcon = tradecrafts[tradecraft].icon;
      const icon = makeIcon(tradecraftIcon, iconStyle);
      const option = {
        name: tradecraftName,
        icon: icon,
        callback: () => {
          fluency.update({
            system: {
              field: field,
              tradecraft: tradecraft,
            },
          });
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

export function fieldContextMenu(fluency) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let fields = CONFIG.TERIOCK.tradecraftOptions;
  for (const field in fields) {
    const fieldName = fields[field].name;
    const icon = makeIcon(fields[field].icon, iconStyle);
    const firstTradecraft = Object.keys(fields[field].tradecrafts)[0];
    const option = {
      name: fieldName,
      icon: icon,
      callback: () => {
        fluency.update({
          system: {
            field: field,
            tradecraft: firstTradecraft,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}
