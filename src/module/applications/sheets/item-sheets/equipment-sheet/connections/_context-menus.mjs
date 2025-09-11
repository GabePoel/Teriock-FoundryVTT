import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates a context menu for selecting power levels within an equipment item.
 * Generates options for all available power levels, excluding "unknown".
 * @param {TeriockEquipment} item - The equipment item to create the context menu for.
 * @returns {Array} Array of context menu options for power level selection.
 */
export function powerLevelContextMenu(item) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let powerLevels = TERIOCK.options.equipment.powerLevel;
  for (const powerLevel in powerLevels) {
    if (powerLevel === "unknown") {
      continue;
    }
    const powerLevelName = powerLevels[powerLevel].name;
    const powerLevelIcon = powerLevels[powerLevel].icon;
    const icon = makeIcon(powerLevelIcon, iconStyle);
    const option = {
      name: powerLevelName,
      icon: icon,
      callback: async () => {
        await item.update({
          system: {
            powerLevel: powerLevel,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}

/**
 * Creates a context menu for selecting fonts within an equipment item.
 * Generates options for all available fonts with a "None" option at the beginning.
 * @param {TeriockEquipment} item - The equipment item to create the context menu for.
 * @returns {Array} Array of context menu options for font selection.
 */
export function fontContextMenu(item) {
  const iconStyle = TERIOCK.display.iconStyles.contextMenu;
  const options = [];
  let fonts = TERIOCK.display.fonts;
  for (const font in fonts) {
    const fontName = fonts[font].name;
    const fontIcon = fontName.charAt(0).toLowerCase();
    const icon = makeIcon(fontIcon, iconStyle);
    const option = {
      name: fontName,
      icon: icon,
      callback: async () => {
        await item.update({
          system: {
            font: fonts[font].cssClass,
          },
        });
      },
    };
    options.push(option);
  }
  const noneOption = {
    name: "None",
    icon: makeIcon("xmark", iconStyle),
    callback: async () => {
      await item.update({
        system: {
          font: "",
        },
      });
    },
  };
  options.unshift(noneOption);
  return options;
}
