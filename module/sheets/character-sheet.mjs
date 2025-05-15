const { sheets, ux, api } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActorSheet)) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'character', 'ability'],
        actions: {
            toggleEquippedDoc: this._toggleEquippedDoc,
            toggleDisabledDoc: this._toggleDisabledDoc,
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
        this._sidebarOpen = true;
    }

    static async _toggleEquippedDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.toggleEquipped();
    }

    static async _toggleDisabledDoc(event, target) {
        const doc = this._embeddedFromCard(target);
        doc.toggleDisabled();
    }

    _getFilteredEquipment() {
        const filters = this.actor.system.sheet.equipmentFilters || {};
        const equipmentSearch = filters.search?.toLowerCase();
        const sortKey = this.actor.system.sheet.equipmentSortOption;
        const ascending = this.actor.system.sheet.equipmentSortAscending;
        let equipment = this.actor.itemTypes.equipment;

        switch (sortKey) {
            case 'name':
                equipment.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'av':
                equipment.sort((a, b) => (a.system.av ?? 0) - (b.system.av ?? 0));
                break;
            case 'bv':
                equipment.sort((a, b) => (a.system.bv ?? 0) - (b.system.bv ?? 0));
                break;
            case 'consumable':
                equipment.sort((a, b) => Number(b.system.consumable) - Number(a.system.consumable));
                break;
            case 'damage':
                equipment.sort((a, b) => (a.system.damage ?? 0) - (b.system.damage ?? 0));
                break;
            case 'dampened':
                equipment.sort((a, b) => Number(b.system.dampened) - Number(a.system.dampened));
                break;
            case 'equipmentType':
                equipment.sort((a, b) => (a.system.equipmentType || '').localeCompare(b.system.equipmentType || ''));
                break;
            case 'equipped':
                equipment.sort((a, b) => Number(b.system.equipped) - Number(a.system.equipped));
                break;
            case 'minStr':
                equipment.sort((a, b) => (a.system.minStr ?? 0) - (b.system.minStr ?? 0));
                break;
            case 'powerLevel':
                equipment.sort((a, b) => (a.system.powerLevel ?? 0) - (b.system.powerLevel ?? 0));
                break;
            case 'shattered':
                equipment.sort((a, b) => Number(b.system.shattered) - Number(a.system.shattered));
                break;
            case 'tier':
                equipment.sort((a, b) => (a.system.tier ?? 0) - (b.system.tier ?? 0));
                break;
            case 'weight':
                equipment.sort((a, b) => (a.system.weight ?? 0) - (b.system.weight ?? 0));
                break;
        }

        if (!ascending) equipment.reverse();

        return equipment.filter(item => {
            if (equipmentSearch && !item.name.toLowerCase().includes(equipmentSearch)) return false;
            if (filters.equipmentClasses && item.system.equipmentClass !== filters.equipmentClasses) return false;
            if (filters.properties && !(item.system.properties || []).includes(filters.properties)) return false;
            if (filters.materialProperties && !(item.system.materialProperties || []).includes(filters.materialProperties)) return false;
            if (filters.magicalProperties && !(item.system.magicalProperties || []).includes(filters.magicalProperties)) return false;
            if (filters.weaponFightingStyles && !(item.system.weaponFightingStyles || []).includes(filters.weaponFightingStyles)) return false;
            if (filters.powerLevel && item.system.powerLevel !== filters.powerLevel) return false;
            if (filters.equipped && !item.system.equipped) return false;
            if (filters.shattered && !item.system.shattered) return false;
            if (filters.dampened && !item.system.dampened) return false;
            if (filters.consumable && !item.system.consumable) return false;
            return true;
        });
    }

    _getFilteredAbilities() {
        const filters = this.actor.system.sheet.abilityFilters;
        const abilitySearch = filters.search?.toLowerCase();
        const sortKey = this.actor.system.sheet.abilitySortOption;
        const ascending = this.actor.system.sheet.abilitySortAscending;
        let abilities = Array.from(this.actor.allApplicableEffects())
            .filter(item => item.type === 'ability');

        switch (sortKey) {
            case 'name':
                abilities.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'sourceName':
                abilities.sort((a, b) => {
                    const aSource = a.parent?.name || '';
                    const bSource = b.parent?.name || '';
                    return aSource.localeCompare(bSource);
                });
                break;
            case 'sourceType':
                abilities.sort((a, b) => {
                    const aSource = a.parent?.type || '';
                    const bSource = b.parent?.type || '';
                    return aSource.localeCompare(bSource);
                });
                break;
            case 'enabled':
                abilities.sort((a, b) => Number(a.disabled) - Number(b.disabled));
                break;
            case 'type':
                abilities.sort((a, b) => {
                    const aType = a.system.abilityType || '';
                    const bType = b.system.abilityType || '';
                    return aType.localeCompare(bType);
                });
                break;
        }

        if (!ascending) abilities.reverse();

        return abilities.filter(item => {
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

    _getFilteredPowers() {
        const filters = this.actor.system.sheet.powerFilters || {};
        const powerSearch = filters.search?.toLowerCase();
        let powers = this.actor.itemTypes.power;

        return powers.filter(item => {
            if (powerSearch && !item.name.toLowerCase().includes(powerSearch)) return false;
            return true;
        });
    }

    _getFilteredFluencies() {
        const filters = this.actor.system.sheet.tradecraftFilters || {};
        const fluencySearch = filters.search?.toLowerCase();
        let fluencies = this.actor.itemTypes.fluency;

        return fluencies.filter(item => {
            if (fluencySearch && !item.name.toLowerCase().includes(fluencySearch)) return false;
            return true;
        });
    }

    _getFilteredRanks() {
        const filters = this.actor.system.sheet.rankFilters || {};
        const rankSearch = filters.search?.toLowerCase();
        let ranks = this.actor.itemTypes.rank;

        return ranks.filter(item => {
            if (rankSearch && !item.name.toLowerCase().includes(rankSearch)) return false;
            return true;
        });
    }

    /** @override */
    async _prepareContext() {
        const allItems = this.actor.itemTypes;
        const abilities = this._getFilteredAbilities();
        const equipment = this._getFilteredEquipment();
        const powers = this._getFilteredPowers();
        const fluencies = this._getFilteredFluencies();
        const ranks = this._getFilteredRanks();
        const context = {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
            abilities: abilities,
            equipment: equipment,
            fluencies: fluencies,
            powers: powers,
            ranks: ranks,
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

        const sidebar = this.element.querySelector('.character-sidebar');
        const sidebarTabber = this.element.querySelector('.character-sidebar-tabber-container');

        sidebar.classList.add('no-transition');
        sidebarTabber.classList.add('no-transition');
        if (this._sidebarOpen) {
            sidebar.classList.remove('collapsed');
            sidebarTabber.classList.remove('collapsed');

        } else {
            sidebar.classList.add('collapsed');
            sidebarTabber.classList.add('collapsed');
        }
        sidebar.offsetHeight;
        sidebarTabber.offsetHeight;

        sidebar.classList.remove('no-transition');
        sidebarTabber.classList.remove('no-transition');

        this.element.querySelectorAll('.character-tabber').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                const tab = event.currentTarget.dataset.tab;
                if (tab !== 'sidebar') {
                    this.document.update({
                        'system.sheet.activeTab': tab,
                    });
                } else {
                    const sidebar = this.element.querySelector('.character-sidebar');
                    const sidebarTabber = this.element.querySelector('.character-sidebar-tabber-container');
                    if (sidebar && sidebarTabber) {
                        sidebar.classList.toggle('collapsed');
                        sidebarTabber.classList.toggle('collapsed');
                    }
                    this._sidebarOpen = !this._sidebarOpen;
                }
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
    }
}