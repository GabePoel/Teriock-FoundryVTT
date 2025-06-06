import { makeIcon } from "../utils.mjs";

export function powerLevelContextMenu(item) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let powerLevels = CONFIG.TERIOCK.equipmentOptions.powerLevel;
  for (const powerLevel in powerLevels) {
    const powerLevelName = powerLevels[powerLevel].name;
    const powerLevelIcon = powerLevels[powerLevel].icon;
    const icon = makeIcon(powerLevelIcon, iconStyle);
    const option = {
      name: powerLevelName,
      icon: icon,
      callback: () => {
        item.update({
          'system': {
            'powerLevel': powerLevel,
          }
        });
      },
    };
    options.push(option);
  }
  return options;
}

export function fontContextMenu(item) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  const options = [];
  let fonts = CONFIG.TERIOCK.fonts;
  for (const font in fonts) {
    const fontName = fonts[font].name;
    const fontIcon = fontName.charAt(0).toLowerCase();
    const icon = makeIcon(fontIcon, iconStyle);
    const option = {
      name: fontName,
      icon: icon,
      callback: () => {
        item.update({
          'system': {
            'font': fonts[font].cssClass,
          }
        });
      },
    };
    options.push(option);
  }
  const noneOption = {
    name: 'None',
    icon: makeIcon('xmark', iconStyle),
    callback: () => {
      item.update({
        'system': {
          'font': '',
        }
      });
    },
  };
  options.unshift(noneOption);
  return options;
}