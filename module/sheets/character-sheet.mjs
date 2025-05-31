const { sheets, api } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";
import { primaryBlockerContextMenu, primaryAttackContextMenu, piercingContextMenu } from "./context-menus/character-context-menus.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(TeriockSheet(sheets.ActorSheet)) {
  static DEFAULT_OPTIONS = {
    classes: ['character'],
    actions: {
      toggleEquippedDoc: this._toggleEquippedDoc,
      toggleDisabledDoc: this._toggleDisabledDoc,
      addEmbedded: this._addEmbedded,
      tradecraftExtra: this._tradecraftExtra,
      rollHitDie: this._rollHitDie,
      rollManaDie: this._rollManaDie,
      rollTradecraft: this._rollTradecraft,
      rollFeatSave: this._rollFeatSave,
      toggleSb: this._toggleSb,
      openPrimaryAttacker: this._openPrimaryAttacker,
      openPrimaryBlocker: this._openPrimaryBlocker,
      quickUse: this._quickUse,
      takeDamage: this._takeDamage,
      takeDrain: this._takeDrain,
      takeWither: this._takeWither,
      removeCondition: this._removeCondition,
      hack: this._hack,
      attack: this._attack,
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
    this._hitDrawerOpen = true;
    this._manaDrawerOpen = true;
    this._dynamicContextMenus = {
      attacker: [],
      blocker: [],
    }
  }

  static async _toggleEquippedDoc(event, target) {
    this._embeddedFromCard(target)?.toggleEquipped();
  }

  static async _toggleDisabledDoc(event, target) {
    this._embeddedFromCard(target)?.toggleDisabled();
  }

  static async _addEmbedded(_, target) {
    const tab = target.dataset.tab;
    const tabMap = {
      ability: {
        docType: 'ActiveEffect',
        data: {
          name: 'New Ability',
          img: 'systems/teriock/assets/ability.svg',
          type: 'ability',
        }
      },
      resource: {
        docType: 'ActiveEffect',
        data: {
          name: 'New Resource',
          img: 'systems/teriock/assets/resource.svg',
          type: 'resource',
        }
      },
      effect: {
        docType: 'ActiveEffect',
        data: {
          name: 'New Effect',
          img: 'systems/teriock/assets/effect.svg',
          type: 'effect',
        }
      },
      equipment: {
        docType: 'Item',
        data: {
          name: 'New Equipment',
          img: 'systems/teriock/assets/equipment.svg',
          type: 'equipment',
        }
      },
      power: {
        docType: 'Item',
        data: {
          name: 'New Power',
          img: 'systems/teriock/assets/power.svg',
          type: 'power',
        }
      },
      rank: {
        docType: 'Item',
        data: {
          name: 'New Rank',
          img: 'systems/teriock/assets/rank.svg',
          type: 'rank',
        }
      },
      fluency: {
        docType: 'Item',
        data: {
          name: 'New Fluency',
          img: 'systems/teriock/assets/fluency.svg',
          type: 'fluency',
        }
      },
    };
    const entry = tabMap[tab];
    if (!entry) return;
    const docs = await this.actor.createEmbeddedDocuments(entry.docType, [entry.data]);
    if (docs[0]?.sheet) docs[0].sheet.render(true);
  }

  static async _tradecraftExtra(event, target) {
    const tradecraft = target.dataset.tradecraft;
    const extra = this.document.system.tradecrafts[tradecraft].extra;
    const newExtra = (extra + 1) % 3;
    await this.document.update({ [`system.tradecrafts.${tradecraft}.extra`]: newExtra });
  }

  static async _rollHitDie(event, target) {
    const id = target.dataset.id;
    const rank = this.actor.items.get(id);
    if (rank) {
      rank.rollHitDie();
    }
  }

  static async _rollManaDie(event, target) {
    const id = target.dataset.id;
    const rank = this.actor.items.get(id);
    if (rank) {
      rank.rollManaDie();
    }
  }

  static async _rollTradecraft(event, target) {
    const tradecraft = target.dataset.tradecraft;
    const options = {};
    if (event.altKey) options.advantage = true;
    if (event.shiftKey) options.disadvantage = true;
    this.actor.rollTradecraft(tradecraft, options);
  }

  static async _rollFeatSave(event, target) {
    const attribute = target.dataset.attribute;
    const options = {};
    if (event.altKey) options.advantage = true;
    if (event.shiftKey) options.disadvantage = true;
    this.actor.rollFeatSave(attribute, options);
  }

  static async _toggleSb(event, target) {
    this.document.update({ 'system.sb': !this.document.system.sb });
  }

  static async _openPrimaryAttacker(event, target) {
    event.stopPropagation();
    this.document.system.primaryAttacker.sheet.render(true);
  }

  static async _openPrimaryBlocker(event, target) {
    event.stopPropagation();
    this.document.system.primaryBlocker.sheet.render(true);
  }

  static async _quickUse(event, target) {
    event.stopPropagation();
    const id = target.dataset.id;
    const item = this.document.items.get(id);
    if (item) {
      const options = {
        secret: true,
      };
      if (event.altKey) options.advantage = true;
      if (event.shiftKey) options.disadvantage = true;
      if (event.ctrlKey) options.twoHanded = true;
      item.roll(options);
    }
  }

  static async _takeDamage(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: 'Take Damage' },
      content: '<input type="number" name="damage" placeholder="Damage Amount">',
      ok: {
        label: 'Confirm',
        callback: (event, button, dialog) => {
          let input = button.form.elements.damage.value;
          if (input) {
            this.document.takeDamage(Number(input));
          }
        }
      }
    })
  }

  static async _takeDrain(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: 'Take Drain' },
      content: '<input type="number" name="drain" placeholder="Drain Amount">',
      ok: {
        label: 'Confirm',
        callback: (event, button, dialog) => {
          let input = button.form.elements.drain.value;
          if (input) {
            this.document.takeDrain(Number(input));
          }
        }
      }
    })
  }

  static async _takeWither(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: 'Take Wither' },
      content: '<input type="number" name="wither" placeholder="Wither Amount">',
      ok: {
        label: 'Confirm',
        callback: (event, button, dialog) => {
          let input = button.form.elements.wither.value;
          if (input) {
            this.document.takeWither(Number(input));
          }
        }
      }
    })
  }

  static async _removeCondition(event, target) {
    event.stopPropagation();
    const options = {};
    const condition = target.dataset.condition;
    if (event.altKey) options.increaseDie = true;
    if (event.shiftKey) options.decreaseDie = true;
    if (event.ctrlKey) options.skip = true;
    this.actor.rollCondition(condition, options);
  }

  _forceRemoveCondition(condition) {
    this.actor.rollCondition(condition, { skip: true });
  }

  static async _hack(event, target) {
    event.stopPropagation();
    const part = target.dataset.part;
    await this.actor.hack(part);
  }

  static async _attack(event, target) {
    event.stopPropagation();
    // const abilities = Array.from(this.actor.allApplicableEffects()).filter(i => i.type === 'ability');
    // const basicAttack = abilities.find(a => a.system.basic && a.name === 'Basic Attack');
    // if (basicAttack) {
    //   await basicAttack.roll({
    //     advantage: event.altKey,
    //     disadvantage: event.shiftKey,
    //   });
    // }
    this.actor.useAbility('Basic Attack');
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

    return equipment.filter(i => {
      const name = i.name?.toLowerCase() ?? '';
      const search = filters.search?.toLowerCase() ?? '';
      const equipmentClass = (i.system.equipmentClass ?? '').toLowerCase();
      const filterEquipmentClass = (filters.equipmentClasses ?? '').toLowerCase();
      const properties = (i.system.properties || []).map(p => (p ?? '').toLowerCase());
      const filterProperty = (filters.properties ?? '').toLowerCase();
      const transferredEffects = (i.transferredEffects || []).map(eff => (eff.name ?? '').toLowerCase());
      const materialProperties = (i.system.materialProperties || []).map(p => (p ?? '').toLowerCase());
      const filterMaterialProperty = (filters.materialProperties ?? '').toLowerCase();
      const magicalProperties = (i.system.magicalProperties || []).map(p => (p ?? '').toLowerCase());
      const filterMagicalProperty = (filters.magicalProperties ?? '').toLowerCase();
      const weaponFightingStyles = (i.system.weaponFightingStyles || []).map(p => (p ?? '').toLowerCase());
      const filterWeaponFightingStyle = (filters.weaponFightingStyles ?? '').toLowerCase();

      return (
        (!search || name.includes(search)) &&
        (!filterEquipmentClass || equipmentClass === filterEquipmentClass) &&
        (
          !filterProperty ||
          properties.includes(filterProperty) ||
          transferredEffects.some(eff => (eff.includes(filterProperty) && eff.type === 'property'))
        ) &&
        (
          !filterMaterialProperty ||
          materialProperties.includes(filterMaterialProperty) ||
          transferredEffects.some(eff => (eff.includes(filterMaterialProperty) && eff.type === 'property'))
        ) &&
        (
          !filterMagicalProperty ||
          magicalProperties.includes(filterMagicalProperty) ||
          transferredEffects.some(eff => (eff.includes(filterMagicalProperty) && eff.type === 'property'))
        ) &&
        (!filterWeaponFightingStyle || weaponFightingStyles.includes(filterWeaponFightingStyle)) &&
        (!filters.powerLevel || i.system.powerLevel === filters.powerLevel) &&
        (!filters.equipped || i.system.equipped) &&
        (!filters.shattered || i.system.shattered) &&
        (!filters.dampened || i.system.dampened) &&
        (!filters.consumable || i.system.consumable)
      );
    });
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

  _getFilteredConditions() {
    return this._filterItems(
      Array.from(this.actor.allApplicableEffects()).filter(i => !(['resource', 'ability'].includes(i.type))),
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

  _getFilteredEffects() {
    return this._filterItems(
      Array.from(this.actor.allApplicableEffects()).filter(i => i.type === 'effect'),
      this.actor.system.sheet.effectFilters || {}
    );
  }

  /** @override */
  async _prepareContext() {
    let conditions = Array.from(this.actor.statuses || []);
    // Sort: 'down' first, 'dead' second, rest alphabetical
    conditions.sort((a, b) => {
      if (a === 'dead') return -1;
      if (b === 'dead') return 1;
      if (a === 'unconscious') return b === 'dead' ? 1 : -1;
      if (b === 'unconscious') return a === 'dead' ? -1 : 1;
      if (a === 'down') {
        if (b === 'dead' || b === 'unconscious') return 1;
        return -1;
      }
      if (b === 'down') {
        if (a === 'dead' || a === 'unconscious') return -1;
        return 1;
      }
      return a.localeCompare(b);
    });

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
      effects: this._getFilteredEffects(),
      ranks: this._getFilteredRanks(),
      name: this.actor.name,
      img: this.actor.img,
      sidebarOpen: this._sidebarOpen,
      tabs: {
        classes: {
          cssClass: this.tabGroups.primary === 'classes' ? 'active' : '',
          group: 'primary',
          id: 'classes',
          label: 'Classes',
        },
      },
      enrichedNotes: await this._editor(this.document.system.sheet.notes),
      enrichedSpecialRules: await this._editor(this.document.system.primaryAttacker?.system?.specialRules),
      conditions,
    };
    return context;
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
    const hitDrawer = this.element.querySelector('.hit-die-drawer');
    const manaDrawer = this.element.querySelector('.mana-die-drawer');

    sidebar.classList.add('no-transition');
    tabber.classList.add('no-transition');
    hitDrawer.classList.add('no-transition');
    manaDrawer.classList.add('no-transition');

    sidebar.classList.toggle('collapsed', !this._sidebarOpen);
    tabber.classList.toggle('collapsed', !this._sidebarOpen);
    hitDrawer.classList.toggle('closed', !this._hitDrawerOpen);
    manaDrawer.classList.toggle('closed', !this._manaDrawerOpen);

    sidebar.offsetHeight;
    tabber.offsetHeight;
    hitDrawer.offsetHeight;
    manaDrawer.offsetHeight;

    sidebar.classList.remove('no-transition');
    tabber.classList.remove('no-transition');
    hitDrawer.classList.remove('no-transition');
    manaDrawer.classList.remove('no-transition');

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

    this.element.querySelectorAll('.character-hit-bar-overlay-row').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        hitDrawer.classList.toggle('closed');
        this._hitDrawerOpen = !this._hitDrawerOpen;
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll('.character-mana-bar-overlay-row').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        manaDrawer.classList.toggle('closed');
        this._manaDrawerOpen = !this._manaDrawerOpen;
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll('.die-box').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = el.dataset.id;
        const rank = this.actor.items.get(id);
        const die = el.dataset.die;
        if (die === 'hit') {
          rank.update({ 'system.hitDieSpent': !rank.system.hitDieSpent });
        } else if (die === 'mana') {
          rank.update({ 'system.manaDieSpent': !rank.system.manaDieSpent });
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

    this.element.querySelector('.character-penalty-box').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.document.update({ 'system.attackPenalty': 0 });
      e.stopPropagation();
    });

    this.element.querySelectorAll('.condition-toggle').forEach(el => {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const condition = el.dataset.condition;
        this._forceRemoveCondition(condition);
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll('.hack-marker-box').forEach(el => {
      el.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        const part = el.dataset.part;
        await this.actor.healHack(part);
        e.stopPropagation();
      });
    });

    primaryBlockerContextMenu(this.actor, this._dynamicContextMenus.blocker);
    primaryAttackContextMenu(this.actor, this._dynamicContextMenus.attacker);

    this._connectContextMenu('.character-primary-blocker-select', this._dynamicContextMenus.blocker, 'click');
    this._connectContextMenu('.character-primary-attacker-select', this._dynamicContextMenus.attacker, 'click');
    this._connectContextMenu('.character-piercing-box', piercingContextMenu(this.actor), 'click');
  }
}
