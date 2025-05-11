const { sheets, ux, api } = foundry.applications;
const { ActiveEffect } = foundry.documents;
import { openWikiPage } from "../helpers/wiki.mjs";
import { TeriockEffect } from "../documents/effect.mjs";
import { createAbility, connectEmbedded } from "../helpers/sheet-helpers.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'character', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            createAbility: this._createEffect,
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
            abilities: this.actor.appliedEffects,
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

    static async _createEffect(event, target) {
        console.log('Creating effect');
        // await foundry.documents.ActiveEffect.implementation.createDocument({ name: "Ability", type: 'ability' }, { parent: this.actor });
        // const aeCls = getDocumentClass('ActiveEffect');
        TeriockEffect.implementation.create({
            name: "Ability",
            type: 'ability',
        }, {
            parent: this.actor,
        });
        // const effectData = {
        //     name: aeCls.defaultName({
        //         parent: this.actor,
        //         type: 'ability',
        //     })
        // }
        // // foundry.utils.setProperty()
        // await aeCls.create(effectData, {
        //     parent: this.actor,
        // });
        // console.log(this.actor);
    }

    _getAbility(id, parentId) {
        if (parentId) {
            return this.document.items.get(parentId)?.effects.get(id);
        } else {
            return this.document.effects.get(id);
        }
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
                event.stopPropagation();
            });
        });
        connectEmbedded(this.actor, this.element);
        this.element.querySelectorAll('.equipToggle').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const id = el.getAttribute('data-id');
                console.log(id);
                const embedded = this.document.items.get(id);
                console.log(embedded);
                embedded._toggleEquip();
                event.stopPropagation();
            });
        });
    }
}