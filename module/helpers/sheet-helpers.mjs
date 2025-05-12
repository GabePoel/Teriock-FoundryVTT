import { TeriockEffect } from "../documents/effect.mjs";
import { makeIcon } from "./utils.mjs";
const { ux } = foundry.applications;

export async function createAbility(document, name) {
    let abilityName = "New Ability";
    if (name) {
        abilityName = name;
    }
    const ability = await TeriockEffect.create({
        name: abilityName,
        type: "ability",
        img: "systems/teriock/assets/ability.svg",
    }, {
        parent: document,
    });
    console.log(ability);
    if (name) {
        ability._wikiPull();
    }
}

export function connectEmbedded(document, element) {
    element.querySelectorAll('.tcard').forEach((el) => {
        const id = el.getAttribute('data-id');
        const parentId = el.getAttribute('data-parent-id');
        const embedded = document.items?.get(id) || document.effects?.get(id) || document.items?.get(parentId)?.effects.get(id);
        if (embedded) {
            new ux.ContextMenu(
                el,
                '.tcard',
                [
                    // Non-item Entries
                    {
                        name: 'Enable',
                        icon: '<i class="fa-solid fa-check"></i>',
                        callback: () => {
                            if (embedded.type === 'ability') {
                                embedded.setForceDisabled(false);
                            } else {
                                embedded.enable();
                            }
                        },
                        condition: () => {
                            if (embedded.type === 'ability') {
                                return embedded.system.forceDisabled;
                            } else if (embedded.type === 'equipment') {
                                return false;
                            } else {
                                return embedded.system.disabled;
                            }
                        }
                    },
                    {
                        name: 'Disable',
                        icon: '<i class="fa-solid fa-xmark"></i>',
                        callback: () => {
                            if (embedded.type === 'ability') {
                                embedded.setForceDisabled(true);
                            } else {
                                embedded.disable();
                            }
                        },
                        condition: () => {
                            if (embedded.type === 'ability') {
                                return !embedded.system.forceDisabled;
                            } else if (embedded.type === 'equipment') {
                                return false;
                            } else {
                                return !embedded.system.disabled;
                            }
                        }
                    },
                    // Item Entries
                    {
                        name: 'Equip',
                        icon: '<i class="fa-solid fa-check"></i>',
                        callback: () => {
                            embedded.equip();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.equipped;
                        }
                    },
                    {
                        name: 'Unequip',
                        icon: '<i class="fa-solid fa-xmark"></i>',
                        callback: () => {
                            embedded.unequip();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.equipped;
                        }
                    },
                    {
                        name: 'Shatter',
                        icon: '<i class="fa-solid fa-wine-glass-crack"></i>',
                        callback: () => {
                            embedded.shatter();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.shattered;
                        }
                    },
                    {
                        name: 'Repair',
                        icon: '<i class="fa-solid fa-wine-glass"></i>',
                        callback: () => {
                            embedded.repair();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.shattered;
                        }
                    },
                    // General Entries
                    // {
                    //     // name: 'Open ' + embedded.name,
                    //     // icon: makeIcon(CONFIG.TERIOCK.documentOptions[embedded.type].icon, CONFIG.TERIOCK.iconStyles.contextMenu),
                    //     name: 'Open',
                    //     icon: '<i class="fa-solid fa-arrow-up-right-from-square"></i>',
                    //     callback: () => {
                    //         embedded.sheet.render(true);
                    //     }
                    // },
                    {
                        // name: 'Open ' + embedded.parent?.name,
                        // icon: makeIcon(CONFIG.TERIOCK.documentOptions[embedded.parent?.type].icon, CONFIG.TERIOCK.iconStyles.contextMenu),
                        name: 'Open Parent',
                        icon: '<i class="fa-solid fa-arrow-up-right-from-square"></i>',
                        callback: () => {
                            const parent = embedded.parent;
                            if (parent) {
                                parent.sheet.render(true);
                            }
                        },
                        condition: () => {
                            return embedded.documentName === 'ActiveEffect' && embedded.parent;
                        }
                    },
                    {
                        name: 'Delete',
                        icon: '<i class="fas fa-trash"></i>',
                        callback: () => {
                            embedded.delete();
                        }
                    },
                    {
                        name: 'Duplicate',
                        icon: '<i class="fas fa-copy"></i>',
                        callback: async () => {
                            const copy = await foundry.utils.duplicate(embedded)
                            console.log(copy);
                            embedded.parent.createEmbeddedDocuments(embedded.documentName, [copy], { render: true });
                        }
                    },
                ],
                {
                    eventName: 'contextmenu',
                    jQuery: false,
                    fixed: true,
                }
            );
            el.addEventListener('click', (event) => {
                event.preventDefault();
                embedded.sheet.render(true);
            });
        }
    });
}