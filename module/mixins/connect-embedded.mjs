import { makeIcon } from "../helpers/utils.mjs";
const { ux } = foundry.applications;

export default function connectEmbedded(document, element) {
    const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
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
                        icon: makeIcon('check', iconStyle),
                        callback: () => {
                            if (embedded.documentName === 'ActiveEffect') {
                                embedded.setForceDisabled(false);
                            } else {
                                embedded.enable();
                            }
                        },
                        condition: () => {
                            if (embedded.documentName === 'ActiveEffect') {
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
                        icon: makeIcon('xmark', iconStyle),
                        callback: () => {
                            if (embedded.documentName === 'ActiveEffect') {
                                embedded.setForceDisabled(true);
                            } else {
                                embedded.disable();
                            }
                        },
                        condition: () => {
                            if (embedded.documentName === 'ActiveEffect') {
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
                        icon: makeIcon('check', iconStyle),
                        callback: () => {
                            embedded.equip();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.equipped;
                        }
                    },
                    {
                        name: 'Unequip',
                        icon: makeIcon('xmark', iconStyle),
                        callback: () => {
                            embedded.unequip();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.equipped;
                        }
                    },
                    {
                        name: 'Glue',
                        icon: makeIcon('link', iconStyle),
                        callback: () => {
                            embedded.update({
                                'system.glued': !embedded.system.glued,
                            });
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.glued;
                        }
                    },
                    {
                        name: 'Unglue',
                        icon: makeIcon('link-slash', iconStyle),
                        callback: () => {
                            embedded.update({
                                'system.glued': !embedded.system.glued,
                            });
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.glued;
                        }
                    },
                    {
                        name: 'Shatter',
                        icon: makeIcon('wine-glass-crack', iconStyle),
                        callback: () => {
                            embedded.shatter();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.shattered;
                        }
                    },
                    {
                        name: 'Repair',
                        icon: makeIcon('wine-glass', iconStyle),
                        callback: () => {
                            embedded.repair();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.shattered;
                        }
                    },
                    {
                        name: 'Dampen',
                        icon: makeIcon('bell-slash', iconStyle),
                        callback: () => {
                            embedded.dampen();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && !embedded.system.dampened;
                        }
                    },
                    {
                        name: 'Undampen',
                        icon: makeIcon('bell', iconStyle),
                        callback: () => {
                            embedded.undampen();
                        },
                        condition: () => {
                            return embedded.type === 'equipment' && embedded.system.dampened;
                        }
                    },
                    // General Entries
                    {
                        name: 'Open Source',
                        icon: makeIcon('arrow-up-right-from-square', iconStyle),
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
                        icon: makeIcon('trash', iconStyle),
                        callback: () => {
                            embedded.delete();
                        }
                    },
                    {
                        name: 'Duplicate',
                        icon: makeIcon('copy', iconStyle),
                        callback: async () => {
                            const copy = await foundry.utils.duplicate(embedded)
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
            el.querySelectorAll('[data-action="useOneDoc"]').forEach((actionEl) => {
                actionEl.addEventListener('contextmenu', (event) => {
                    event.stopPropagation();
                    embedded.gainOne();
                });
            });
        }
    });
}