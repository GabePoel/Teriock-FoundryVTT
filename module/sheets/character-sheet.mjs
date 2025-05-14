const { sheets, ux, api } = foundry.applications;
import { openWikiPage } from "../helpers/wiki.mjs";
import { TeriockEffect } from "../documents/effect.mjs";
import { createAbility, connectEmbedded } from "../helpers/sheet-helpers.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

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
        window: {
            resizable: true,
            icon: "fa-solid fa-" + documentOptions.character.icon,
        }
    }
    static PARTS = {
        all: {
            template: 'systems/teriock/templates/sheets/character-template/character-template.hbs',
            scrollable: [
                '.character-sidebar',
                '.character-tab-content',
            ]
        },
    };

    /** @override */
    constructor(...args) {
        super(...args);
        this._filterMenuOpen = false;
        this._displayMenuOpen = false;
    }

    _getFilteredAbilities() {
        const filters = this.actor.system.sheet.abilityFilters;
        const abilitySearch = filters.search?.toLowerCase();

        return [...this.actor.appliedEffects].filter(item => {
            if (abilitySearch && !item.name.toLowerCase().includes(abilitySearch)) return false;
            if (filters.basic && !item.system.basic) return false;
            if (filters.standard && !item.system.standard) return false;
            if (filters.skill && !item.system.skill) return false;
            if (filters.spell && !item.system.spell) return false;
            if (filters.ritual && !item.system.ritual) return false;
            if (filters.rotator && !item.system.rotator) return false;
            if (filters.verbal && !item.system.costs.verbal) return false;
            if (filters.somatic && !item.system.costs.somatic) return false;
            if (filters.material && !item.system.costs.material) return false;
            if (filters.invoked && !item.system.costs.invoked) return false;
            if (filters.sustained && !item.system.sustained) return false;
            if (filters.broken && !item.system.break) return false;
            if (filters.hp && !item.system.costs.hp) return false;
            if (filters.mp && !item.system.costs.mp) return false;
            if (filters.heightened && !item.system.heightened) return false;
            if (filters.expansion && !item.system.expansion) return false;
            if (filters.maneuver && item.system.maneuver !== filters.maneuver) return false;
            if (filters.interaction && item.system.interaction !== filters.interaction) return false;
            if (filters.delivery && item.system.delivery.base !== filters.delivery) return false;
            if (filters.target && !item.system.targets.includes(filters.target)) return false;
            if (filters.powerSource && !item.system.powerSources.includes(filters.powerSource)) return false;
            if (filters.element && !item.system.elements.includes(filters.element)) return false;
            if (filters.effects && !filters.effects.every(effect => item.system.effects.includes(effect))) return false;
            return true;
        });
    }


    /** @override */
    async _prepareContext() {
        const allItems = this.actor.itemTypes;
        const abilities = this._getFilteredAbilities();
        const context = {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
            abilities: abilities,
            equipment: allItems.equipment,
            fluencies: allItems.fluency,
            powers: allItems.power,
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
                    'system.sheet.activeTab': tab,
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
                embedded.toggleEquipped();
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.shareAbility').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const id = el.getAttribute('data-id');
                const parentId = el.getAttribute('data-parent-id');
                const ability = this._getAbility(id, parentId);
                if (ability) {
                    ability.share();
                }
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.share').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const id = el.getAttribute('data-id');
                const item = this.document.items.get(id);
                if (item) {
                    item.share();
                }
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.enableAbility').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const id = el.getAttribute('data-id');
                const parentId = el.getAttribute('data-parent-id');
                const ability = this._getAbility(id, parentId);
                if (ability) {
                    ability.toggleForceDisabled();
                }
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.toggleDisabled').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const id = el.getAttribute('data-id');
                const embedded = this.document.items.get(id);
                if (embedded) {
                    embedded.toggleDisabled();
                }
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.options-menu-toggle, .filter-menu-toggle').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const path = element.dataset.path;
                const currentValue = element.dataset.bool;

                if (!path) return;

                const currentBool = currentValue === "true";
                const update = {};
                update[path] = !currentBool;

                this.document.update(update);
            });
        });
        this.element.querySelectorAll('.ch-attribute-save-box').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const attribute = element.dataset.attribute;
                this.document.update({
                    [`system.attributes.${attribute}.saveProficient`]: !this.document.system.attributes[attribute].saveProficient,
                });
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.ch-attribute-save-box').forEach((element) => {
            element.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                const attribute = element.dataset.attribute;
                this.document.update({
                    [`system.attributes.${attribute}.saveFluent`]: !this.document.system.attributes[attribute].saveFluent,
                });
                event.stopPropagation();
            });
        });
        this.element.querySelectorAll('.ch-tradecraft-pro-box').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const tradecraft = element.dataset.tradecraft;
                this.document.update({
                    [`system.tradecrafts.${tradecraft}.proficient`]: !this.document.system.tradecrafts[tradecraft].proficient,
                });
                event.stopPropagation();
            });
        });
    }
}