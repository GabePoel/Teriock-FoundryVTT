const { sheets, ux, api } = foundry.applications
import { openWikiPage } from "../helpers/wiki.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'character', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
        },
        form: {
            submitOnChange: true,
        },
        position: {
            width: 800,
            height: 600,
        },
    }
    static PARTS = {
        all: {
            template: 'systems/teriock/templates/character-template.hbs',
        },
        // classes: {
        //     template: 'systems/teriock/templates/parts/character-parts/character-tab-classes.hbs',
        //     scrollable: [''],
        // },
        // abilities: {
        //     template: 'systems/teriock/templates/parts/character-parts/character-tab-abilities.hbs',
        //     scrollable: [''],
        // },
    };

    /** @override */
    async _prepareContext() {
        const allItems = this.actor.itemTypes
        const context = {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
            abilities: allItems.ability,
            equipment: allItems.equipment,
            fluencies: allItems.fluency,
            ranks: allItems.rank,
            name: this.actor.name,
            img: this.actor.img,
        };
        // if (!this.tabGroups.primary) this.tabGroups.primary = 'classes';
        context.tabs = {
            classes: {
                cssClass: this.tabGroups.primary === 'classes' ? 'active' : '',
                group: 'primary',
                id: 'classes',
                icon: '',
                label: 'Classes',
            }
        }
        return context
    }

    _rankContextMenuOptions(id) {
        return [
            {
                name: 'Edit',
                icon: '<i class="fas fa-edit"></i>',
                callback: () => {
                    const item = this.actor.items.get(id);
                    if (item) {
                        item.sheet.render(true);
                    }
                },
            },
            {
                name: 'Delete',
                icon: '<i class="fas fa-trash"></i>',
                callback: () => {
                    const item = this.actor.items.get(id);
                    if (item) {
                        item.delete();
                    }
                },
            },
        ]
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        this.element.querySelectorAll('.character-tabber').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const tab = event.currentTarget.getAttribute('tab');
                this.document.update({
                    'system.activeTab': tab,
                })
            });
        });
        this.element.querySelectorAll('.tcard').forEach((element) => {
            new ux.ContextMenu(
                element,
                '.tcard',
                this._rankContextMenuOptions(
                    element.getAttribute('data-id')
                ),
                {
                    eventName: 'contextmenu',
                    jQuery: false,
                    fixed: true,
                }
            );
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const id = element.getAttribute('data-id');
                const item = this.actor.items.get(id);
                if (item) {
                    item.sheet.render(true);
                }
            });
        });
    }
}