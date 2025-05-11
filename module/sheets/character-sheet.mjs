const { sheets, ux, api } = foundry.applications;
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

    _getFilteredAbilities() {
        let abilities = [...this.actor.appliedEffects];
        const filters = this.actor.system.sheet.abilityFilters;
        const abilitySearch = filters.search;
        if ((abilitySearch) && (abilitySearch.length > 0)) {
            abilities = abilities.filter((item) => {
                return item.name.toLowerCase().includes(abilitySearch.toLowerCase());
            });
        }
        if (filters.basic) {
            abilities = abilities.filter((item) => {
                return item.system.basic;
            });
        }
        if (filters.standard) {
            abilities = abilities.filter((item) => {
                return item.system.standard;
            });
        }
        if (filters.skill) {
            abilities = abilities.filter((item) => {
                return item.system.skill;
            });
        }
        if (filters.spell) {
            abilities = abilities.filter((item) => {
                return item.system.spell;
            });
        }
        if (filters.ritual) {
            abilities = abilities.filter((item) => {
                return item.system.ritual;
            });
        }
        if (filters.rotator) {
            abilities = abilities.filter((item) => {
                return item.system.rotator;
            });
        }
        if (filters.verbal) {
            abilities = abilities.filter((item) => {
                return item.system.costs.verbal;
            });
        }
        if (filters.somatic) {
            abilities = abilities.filter((item) => {
                return item.system.costs.somatic;
            });
        }
        if (filters.material) {
            abilities = abilities.filter((item) => {
                return item.system.costs.material;
            });
        }
        if (filters.invoked) {
            abilities = abilities.filter((item) => {
                return item.system.costs.invoked;
            });
        }
        if (filters.sustained) {
            abilities = abilities.filter((item) => {
                return item.system.sustained;
            });
        }
        if (filters.broken) {
            abilities = abilities.filter((item) => {
                return item.system.break;
            });
        }
        if (filters.hp) {
            abilities = abilities.filter((item) => {
                return item.system.costs.hp;
            });
        }
        if (filters.mp) {
            abilities = abilities.filter((item) => {
                return item.system.costs.mp;
            });
        }
        if (filters.heightened) {
            abilities = abilities.filter((item) => {
                return item.system.heightened;
            });
        }
        if (filters.expansion) {
            abilities = abilities.filter((item) => {
                return item.system.expansion;
            });
        }
        if (filters.maneuver) {
            abilities = abilities.filter((item) => {
                return item.system.maneuver == filters.maneuver;
            });
        }
        if (filters.interaction) {
            abilities = abilities.filter((item) => {
                return item.system.interaction == filters.interaction;
            });
        }
        if (filters.delivery) {
            abilities = abilities.filter((item) => {
                return item.system.delivery.base == filters.delivery;
            });
        }
        if (filters.target) {
            abilities = abilities.filter((item) => {
                return item.system.targets.includes(filters.target);
            });
        }
        if (filters.powerSource) {
            abilities = abilities.filter((item) => {
                return item.system.powerSources.includes(filters.powerSource);
            });
        }
        if (filters.element) {
            abilities = abilities.filter((item) => {
                return item.system.elements.includes(filters.element);
            });
        }
        if (filters.effects) {
            abilities = abilities.filter((item) => {
                return filters.effects.every(effect => item.system.effects.includes(effect));
            });
        }
        return abilities;
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
                embedded._toggleEquip();
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
    }
}