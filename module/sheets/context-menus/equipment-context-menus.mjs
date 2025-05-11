import { makeIcon } from "../../helpers/utils.mjs";

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