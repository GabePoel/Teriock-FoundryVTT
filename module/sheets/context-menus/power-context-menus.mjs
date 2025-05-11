import { makeIcon } from "../../helpers/utils.mjs";

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
                    'system': {
                        'type': type,
                    }
                });
            }
        };
        options.push(option);
    }
    return options;
}