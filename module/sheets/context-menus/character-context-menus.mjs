export function primaryBlockerContextMenu(actor, options) {
    const equipped = actor.itemTypes.equipment.filter(i => i.system.equipped && i.system.bv);
    console.log(equipped);
    equipped.sort((a, b) => (b.system.bv ?? 0) - (a.system.bv ?? 0));
    const blockerOptions = [];
    for (const item of equipped) {
        const bv = item.system.bv ?? 0;
        const icon = `<i class="fa-solid fa-${bv}"></i>`;
        blockerOptions.push({
            name: item.name,
            icon: icon,
            callback: () => {
                actor.update({
                    "system.sheet.primaryBlocker": item._id,
                })
            },
        });
    }
    options.length = 0;
    options.push(...blockerOptions);
    return options;
}

export function primaryAttackContextMenu(actor, options) {
    const equipped = actor.itemTypes.equipment.filter(i => i.system.equipped && (i.system.properties?.includes("weapon") || i.system.properties?.includes("bashing")));
    const attackOptions = [];
    for (const item of equipped) {
        let icon = "";
        if (item.system.properties?.includes("weapon")) {
            icon = `<i class="fa-solid fa-sword"></i>`;
        } else if (item.system.properties?.includes("bashing")) {
            icon = `<i class="fa-solid fa-staff"></i>`;
        }
        attackOptions.push({
            name: item.name,
            icon: icon,
            callback: () => {
                actor.update({
                    "system.sheet.primaryAttacker": item._id,
                })
            },
        });
    }
    options.length = 0;
    options.push(...attackOptions);
    return options;
}

export function piercingContextMenu(actor) {
    return [
        {
            name: "None",
            icon: `<i class="fa-solid fa-xmark"></i>`,
            callback: () => {
                actor.update({
                    "system.piercing": 'none',
                })
            }
        },
        {
            name: "AV0",
            icon: `<i class="fa-solid fa-a"></i>`,
            callback: () => {
                actor.update({
                    "system.piercing": 'av0',
                })
            }
        },
        {
            name: "UB",
            icon: `<i class="fa-solid fa-u"></i>`,
            callback: () => {
                actor.update({
                    "system.piercing": 'ub',
                })
            }
        }
    ]
}