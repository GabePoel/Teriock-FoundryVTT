const { sheets, ux, api } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActorSheet)) {
    static DEFAULT_OPTIONS = {
        classes: ['character'],
        actions: {
            toggleEquippedDoc: this._toggleEquippedDoc,
            toggleDisabledDoc: this._toggleDisabledDoc,
        },
        form: {
            submitOnChange: true,
        },
        position: { width: 800, height: 600 },
        window: {
            icon: `fa-solid fa-${documentOptions.character.icon}`,
        },
    };

    static PARTS = {
        all: {
            template: 'systems/teriock/templates/sheets/character-template/character-template.hbs',
            scrollable: ['.character-sidebar', '.character-tab-content'],
        },
    };

    constructor(...args) {
        super(...args);
        this._filterMenuOpen = false;
        this._displayMenuOpen = false;
        this._sidebarOpen = true;
    }

    static async _toggleEquippedDoc(event, target) {
        this._embeddedFromCard(target)?.toggleEquipped();
    }

    static async _toggleDisabledDoc(event, target) {
        this._embeddedFromCard(target)?.toggleDisabled();
    }

    /** Generalized filtering utility */
    _filterItems(items, filters, searchKey = 'search') {
        const search = filters[searchKey]?.toLowerCase();
        return items.filter(item => !search || item.name.toLowerCase().includes(search));
    }

    _sortItems(items, sortKey, ascending, accessor = (i) => i.name) {
        items.sort((a, b) => {
            const aVal = accessor(a) ?? '';
            const bVal = accessor(b) ?? '';
            return typeof aVal === 'number' ? aVal - bVal : aVal.localeCompare(bVal);
        });
        return ascending ? items : items.reverse();
    }

    _getFilteredEquipment() {
        const filters = this.actor.system.sheet.equipmentFilters || {};
        let equipment = this.actor.itemTypes.equipment;
        const sortKey = this.actor.system.sheet.equipmentSortOption;
        const ascending = this.actor.system.sheet.equipmentSortAscending;

        const sortMap = {
            name: i => i.name,
            av: i => i.system.av ?? 0,
            bv: i => i.system.bv ?? 0,
            consumable: i => Number(i.system.consumable),
            damage: i => i.system.damage ?? 0,
            dampened: i => Number(i.system.dampened),
            equipmentType: i => i.system.equipmentType ?? '',
            equipped: i => Number(i.system.equipped),
            minStr: i => i.system.minStr ?? 0,
            powerLevel: i => i.system.powerLevel ?? 0,
            shattered: i => Number(i.system.shattered),
            tier: i => i.system.tier ?? 0,
            weight: i => i.system.weight ?? 0,
        };

        equipment = this._sortItems(equipment, sortKey, ascending, sortMap[sortKey]);

        return equipment.filter(i =>
            (!filters.search || i.name.toLowerCase().includes(filters.search.toLowerCase())) &&
            (!filters.equipmentClasses || i.system.equipmentClass === filters.equipmentClasses) &&
            (!filters.properties || (i.system.properties || []).includes(filters.properties)) &&
            (!filters.materialProperties || (i.system.materialProperties || []).includes(filters.materialProperties)) &&
            (!filters.magicalProperties || (i.system.magicalProperties || []).includes(filters.magicalProperties)) &&
            (!filters.weaponFightingStyles || (i.system.weaponFightingStyles || []).includes(filters.weaponFightingStyles)) &&
            (!filters.powerLevel || i.system.powerLevel === filters.powerLevel) &&
            (!filters.equipped || i.system.equipped) &&
            (!filters.shattered || i.system.shattered) &&
            (!filters.dampened || i.system.dampened) &&
            (!filters.consumable || i.system.consumable)
        );
    }

    _getFilteredAbilities() {
        const filters = this.actor.system.sheet.abilityFilters || {};
        let abilities = Array.from(this.actor.allApplicableEffects()).filter(i => i.type === 'ability');
        const sortKey = this.actor.system.sheet.abilitySortOption;
        const ascending = this.actor.system.sheet.abilitySortAscending;

        const sortMap = {
            name: i => i.name,
            sourceName: i => i.parent?.name ?? '',
            sourceType: i => i.parent?.type ?? '',
            enabled: i => Number(i.disabled),
            type: i => i.system.abilityType ?? '',
        };

        abilities = this._sortItems(abilities, sortKey, ascending, sortMap[sortKey]);

        return abilities.filter(i =>
            (!filters.search || i.name.toLowerCase().includes(filters.search.toLowerCase())) &&
            (!filters.basic || i.system.basic) &&
            (!filters.standard || i.system.standard) &&
            (!filters.skill || i.system.skill) &&
            (!filters.spell || i.system.spell) &&
            (!filters.ritual || i.system.ritual) &&
            (!filters.rotator || i.system.rotator) &&
            (!filters.sustained || i.system.sustained) &&
            (!filters.heightened || i.system.heightened) &&
            (!filters.expansion || i.system.expansion) &&
            (!filters.verbal || i.system.costs.verbal) &&
            (!filters.somatic || i.system.costs.somatic) &&
            (!filters.material || i.system.costs.material) &&
            (!filters.invoked || i.system.costs.invoked) &&
            (!filters.hp || i.system.costs.hp) &&
            (!filters.mp || i.system.costs.mp) &&
            (!filters.broken || i.system.break) &&
            (!filters.maneuver || i.system.maneuver === filters.maneuver) &&
            (!filters.interaction || i.system.interaction === filters.interaction) &&
            (!filters.delivery || i.system.delivery.base === filters.delivery) &&
            (!filters.target || (i.system.targets || []).includes(filters.target)) &&
            (!filters.powerSource || (i.system.powerSources || []).includes(filters.powerSource)) &&
            (!filters.element || (i.system.elements || []).includes(filters.element)) &&
            (!filters.effects || filters.effects.every(e => i.system.effects.includes(e)))
        );
    }

    _getFilteredResources() {
        return this._filterItems(
            Array.from(this.actor.allApplicableEffects()).filter(i => i.type === 'resource'),
            this.actor.system.sheet.resourceFilters || {}
        );
    }

    _getFilteredPowers() {
        return this._filterItems(this.actor.itemTypes.power, this.actor.system.sheet.powerFilters || {});
    }

    _getFilteredFluencies() {
        return this._filterItems(this.actor.itemTypes.fluency, this.actor.system.sheet.tradecraftFilters || {});
    }

    _getFilteredRanks() {
        return this._filterItems(this.actor.itemTypes.rank, this.actor.system.sheet.rankFilters || {});
    }

    /** @override */
    async _prepareContext() {
        const context = {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
            abilities: this._getFilteredAbilities(),
            resources: this._getFilteredResources(),
            equipment: this._getFilteredEquipment(),
            powers: this._getFilteredPowers(),
            fluencies: this._getFilteredFluencies(),
            ranks: this._getFilteredRanks(),
            name: this.actor.name,
            img: this.actor.img,
            tabs: {
                classes: {
                    cssClass: this.tabGroups.primary === 'classes' ? 'active' : '',
                    group: 'primary',
                    id: 'classes',
                    label: 'Classes',
                },
            },
            notes: await this._editor(this.document.system.sheet.notes),
        };
        return context;
    }

    _rankContextMenuOptions(id) {
        const item = this.actor.items.get(id);
        return [
            {
                name: 'Edit',
                icon: '<i class="fas fa-edit"></i>',
                callback: () => item?.sheet.render(true),
            },
            {
                name: 'Delete',
                icon: '<i class="fas fa-trash"></i>',
                callback: () => item?.delete(),
            },
        ];
    }

    _getAbility(id, parentId) {
        return parentId
            ? this.document.items.get(parentId)?.effects.get(id)
            : this.document.effects.get(id);
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        const sidebar = this.element.querySelector('.character-sidebar');
        const tabber = this.element.querySelector('.character-sidebar-tabber-container');

        sidebar.classList.add('no-transition');
        tabber.classList.add('no-transition');

        sidebar.classList.toggle('collapsed', !this._sidebarOpen);
        tabber.classList.toggle('collapsed', !this._sidebarOpen);

        sidebar.offsetHeight;
        tabber.offsetHeight;

        sidebar.classList.remove('no-transition');
        tabber.classList.remove('no-transition');

        this.element.querySelectorAll('.character-tabber').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                if (tab === 'sidebar') {
                    sidebar.classList.toggle('collapsed');
                    tabber.classList.toggle('collapsed');
                    this._sidebarOpen = !this._sidebarOpen;
                } else {
                    this.document.update({ 'system.sheet.activeTab': tab });
                }
                e.stopPropagation();
            });
        });

        this.element.querySelectorAll('.ch-attribute-save-box').forEach(el => {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const attr = el.dataset.attribute;
                const current = this.document.system.attributes[attr].saveFluent;
                this.document.update({ [`system.attributes.${attr}.saveFluent`]: !current });
                e.stopPropagation();
            });
        });
    }
}
