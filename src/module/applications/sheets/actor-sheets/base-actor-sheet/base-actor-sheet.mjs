import { conditions } from "../../../../content/conditions.mjs";
import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import { SheetMixin } from "../../mixins/_module.mjs";
import _embeddedFromCard from "../../mixins/methods/_embedded-from-card.mjs";
import {
  piercingContextMenu,
  primaryAttackContextMenu,
  primaryBlockerContextMenu,
} from "./connections/character-context-menus.mjs";
import {
  _addEmbedded,
  _addEquipment,
  _addRank,
} from "./methods/_add-embedded.mjs";
import { _filterAbilities, _filterEquipment } from "./methods/_filters.mjs";
import { _initSearchFilters } from "./methods/_search.mjs";
import { _defaultSheetSettings } from "./methods/_settings.mjs";
import { _sortAbilities, _sortEquipment } from "./methods/_sort.mjs";

const { api, ux } = foundry.applications;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Base actor sheet for actorsUuids.
 * Provides comprehensive character management including abilities, equipment, tradecrafts,
 * and various interactive features like rolling, damage tracking, and condition management.
 *
 * @extends {ActorSheetV2}
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockBaseActorSheet extends SheetMixin(ActorSheetV2) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "character"],
    actions: {
      addEmbedded: this._addEmbedded,
      addEquipment: this._addEquipment,
      addRank: this._addRank,
      attack: this._attack,
      deattuneDoc: this._deattuneDoc,
      endCondition: this._endCondition,
      immune: this._immune,
      openMechanics: this._openMechanics,
      openPrimaryAttacker: this._openPrimaryAttacker,
      openPrimaryBlocker: this._openPrimaryBlocker,
      quickUse: this._quickUse,
      resist: this._resist,
      rollFeatSave: this._rollFeatSave,
      rollStatDie: this._rollStatDie,
      rollTradecraft: this._rollTradecraft,
      takeDamage: this._takeDamage,
      takeDrain: this._takeDrain,
      takeHack: this._takeHack,
      takeWither: this._takeWither,
      toggleAttunedDoc: this._toggleAttunedDoc,
      toggleConditionExpansion: this._toggleConditionExpansion,
      toggleDampenedDoc: this._toggleDampenedDoc,
      toggleDisabledDoc: this._toggleDisabledDoc,
      toggleEquippedDoc: this._toggleEquippedDoc,
      toggleGluedDoc: this._toggleGluedDoc,
      toggleSb: this._toggleSb,
      toggleReaction: this._toggleReaction,
      toggleShatteredDoc: this._toggleShatteredDoc,
      tradecraftExtra: this._tradecraftExtra,
    },
    form: {
      submitOnChange: true,
    },
    position: { width: 800, height: 600 },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
      controls: [
        {
          icon: "fa-solid fa-gears",
          label: "Mechanics",
          action: "openMechanics",
        },
      ],
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/actor-templates/character-template/character-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };

  /**
   * Creates a new base actor sheet instance.
   * Initializes sheet state including menus, drawers, search values, and settings.
   *
   * @param {...any} args - Arguments to pass to the parent constructor.
   */
  constructor(...args) {
    super(...args);
    this._sidebarOpen = true;
    this._hitDrawerOpen = true;
    this._manaDrawerOpen = true;
    this._locked = false;
    this._dynamicContextMenus = {
      attacker: [],
      blocker: [],
    };
    this._embeds = {
      effectTypes: {},
      itemTypes: {},
    };
    this._activeTab = "tradecrafts";
    const sheetSettings = _defaultSheetSettings;
    Object.keys(conditions).forEach((key) => {
      sheetSettings.conditionExpansions[key] = false;
    });
    this.settings = _defaultSheetSettings;

    /** @type {Record<string, string>} */
    this._searchStrings = {};
  }

  /**
   * Toggles the equipped state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleEquippedDoc(_event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await _embeddedFromCard(this, target);
    if (embedded.system.equipped) {
      await embedded.system.unequip();
    } else {
      await embedded.system.equip();
    }
  }

  /**
   * Toggles the attuned state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleAttunedDoc(_event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await _embeddedFromCard(this, target);
    if (embedded.system.isAttuned) {
      await embedded.system.deattune();
    } else {
      await embedded.system.attune();
    }
  }

  /**
   * Toggles the glued state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleGluedDoc(_event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await _embeddedFromCard(this, target);
    if (embedded.system.glued) {
      await embedded.system.unglue();
    } else {
      await embedded.system.glue();
    }
  }

  /**
   * Toggles the dampened state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleDampenedDoc(_event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await _embeddedFromCard(this, target);
    if (embedded.system.dampened) {
      await embedded.system.undampen();
    } else {
      await embedded.system.dampen();
    }
  }

  /**
   * Toggles the shattered state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleShatteredDoc(_event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await _embeddedFromCard(this, target);
    if (embedded.system.shattered) {
      await embedded.system.repair();
    } else {
      await embedded.system.shatter();
    }
  }

  /**
   * Toggles the disabled state of an embedded document.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleDisabledDoc(_event, target) {
    const embedded = await _embeddedFromCard(this, target);
    await embedded?.toggleDisabled();
  }

  /**
   * Adds a new embedded document to the actor.
   * Creates documents based on the specified tab type.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when the document is created.
   * @static
   */
  static async _addEmbedded(_event, target) {
    await _addEmbedded(this, target);
  }

  /**
   * Adds a {@link TeriockRank} to the {@link TeriockActor}.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} _target - The event target.
   * @returns {Promise<void>} Promise that resolves when the {@link TeriockRank} is added.
   * @private
   */
  static async _addRank(_event, _target) {
    await _addRank(this);
  }

  /**
   * Adds a {@link TeriockEquipment} to the {@link TeriockActor}.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} _target - The event target.
   * @returns {Promise<void>}
   * @private
   */
  static async _addEquipment(_event, _target) {
    await _addEquipment(this);
  }

  /**
   * Cycles through tradecraft extra levels (0, 1, 2).
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when tradecraft extra is updated.
   * @static
   */
  static async _tradecraftExtra(_event, target) {
    const tradecraft = target.dataset.tradecraft;
    const extra = this.document.system.tradecrafts[tradecraft].extra;
    const newExtra = (extra + 1) % 3;
    await this.document.update({
      [`system.tradecrafts.${tradecraft}.extra`]: newExtra,
    });
  }

  /**
   * Rolls a stat die.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when hit die is rolled.
   * @static
   */
  static async _rollStatDie(_event, target) {
    const id = target.dataset.id;
    const parentId = target.dataset.parentId;
    const stat = target.dataset.stat;
    await this.document.items
      .get(parentId)
      ["system"][`${stat}Dice`][id].rollStatDie();
  }

  /**
   * Rolls a tradecraft check with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when tradecraft is rolled.
   * @static
   */
  static async _rollTradecraft(event, target) {
    const tradecraft = target.dataset.tradecraft;
    const options = {};
    if (event.altKey) options.advantage = true;
    if (event.shiftKey) options.disadvantage = true;
    await this.actor.rollTradecraft(tradecraft, options);
  }

  /**
   * Rolls a feat save with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when feat save is rolled.
   * @static
   */
  static async _rollFeatSave(event, target) {
    const attribute = target.dataset.attribute;
    const options = {};
    if (event.altKey) options.advantage = true;
    if (event.shiftKey) options.disadvantage = true;
    await this.actor.rollFeatSave(attribute, options);
  }

  /**
   * Toggles the style bonus (sb) state.
   *
   * @returns {Promise<void>} Promise that resolves when sb is toggled.
   * @static
   */
  static async _toggleSb() {
    await this.document.update({ "system.sb": !this.document.system.sb });
  }

  /**
   * Toggles if the character still has a reaction.
   *
   * @returns {Promise<void>} Promise that resolves when sb is toggled.
   * @static
   */
  static async _toggleReaction() {
    await this.document.update({
      "system.hasReaction": !this.document.system.hasReaction,
    });
  }

  /**
   * Opens the mechanics sheet.
   *
   * @returns {Promise<void>}
   * @private
   */
  static async _openMechanics() {
    const mechanics = this.document.itemTypes?.mechanic || [];
    if (mechanics.length > 0) {
      const mechanic = mechanics[0];
      await mechanic.sheet.render(true);
    }
  }

  /**
   * Opens the primary attacker's sheet.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when the sheet is opened.
   * @static
   */
  static async _openPrimaryAttacker(event) {
    event.stopPropagation();
    await this.document.system.wielding.attacker.derived?.sheet.render(true);
  }

  /**
   * Opens the primary blocker's sheet.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when the sheet is opened.
   * @static
   */
  static async _openPrimaryBlocker(event) {
    event.stopPropagation();
    await this.document.system.wielding.blocker.derived?.sheet.render(true);
  }

  /**
   * Quickly uses an item with optional modifiers.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when item is used.
   * @static
   */
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
      item.use(options);
    }
  }

  /**
   * Prompts for damage amount and applies it to the actor.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   * @static
   */
  static async _takeDamage(event) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Damage" },
      content:
        '<input type="number" name="damage" placeholder="Damage Amount">',
      ok: {
        label: "Confirm",
        callback: (_event, button) => {
          let input = button.form.elements.namedItem("damage").value;
          if (input) {
            this.document.takeDamage(Number(input));
          }
        },
      },
    });
  }

  /**
   * Prompts for drain amount and applies it to the actor.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   * @static
   */
  static async _takeDrain(event) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Drain" },
      content: '<input type="number" name="drain" placeholder="Drain Amount">',
      ok: {
        label: "Confirm",
        callback: (_event, button) => {
          let input = button.form.elements.namedItem("drain").value;
          if (input) {
            this.document.takeDrain(Number(input));
          }
        },
      },
    });
  }

  /**
   * Prompts for wither amount and applies it to the actor.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   * @static
   */
  static async _takeWither(event) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Wither" },
      content:
        '<input type="number" name="wither" placeholder="Wither Amount">',
      ok: {
        label: "Confirm",
        callback: (_event, button) => {
          let input = button.form.elements.namedItem("wither").value;
          if (input) {
            this.document.takeWither(Number(input));
          }
        },
      },
    });
  }

  /**
   * Deattunes an attunement effect.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when attunement is removed.
   * @static
   */
  static async _deattuneDoc(event, target) {
    event.stopPropagation();
    const attunement = this.actor.effects.get(target.dataset.id);
    if (attunement) {
      await attunement.delete();
    }
  }

  static async _toggleConditionExpansion(_event, target) {
    const condition = target.dataset.condition;
    this.settings.conditionExpansions[condition] =
      !this.settings.conditionExpansions[condition];
    const conditionBodyEl = this.element.querySelector(
      `.condition-body.${condition}`,
    );
    conditionBodyEl.classList.toggle(
      "expanded",
      this.settings.conditionExpansions[condition],
    );
  }

  /**
   * Applies a hack to a specific body part.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   * @static
   */
  static async _takeHack(event, target) {
    event.stopPropagation();
    const part =
      /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target.dataset
        .part;
    await this.actor.takeHack(part);
  }

  /**
   * Performs a basic attack with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when attack is performed.
   * @static
   */
  static async _attack(event) {
    event.stopPropagation();
    /** @type {Teriock.RollOptions.CommonRoll} */
    const options = {
      advantage: Boolean(event.altKey),
      disadvantage: Boolean(event.shiftKey),
    };
    await this.actor.useAbility("Basic Attack", options);
  }

  /**
   * Rolls resistance with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when resistance is rolled.
   * @static
   */
  static async _resist(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const img = target.querySelector("img");
      if (img) {
        message = img.alt;
      }
    }
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    await this.actor.rollResistance(options);
  }

  /**
   * Rolls immunity with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when immunity is rolled.
   * @static
   */
  static async _immune(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const img = target.querySelector("img");
      if (img) {
        message = img.alt;
      }
    }
    /** @type {Teriock.RollOptions.CommonRoll} */
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    await this.actor.rollImmunity(options);
  }

  /**
   * Ends a condition with optional advantage/disadvantage.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when condition is ended.
   * @static
   */
  static async _endCondition(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const img = target.querySelector("img");
      if (img) {
        message = img.alt;
      }
    }
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    await this.actor.endCondition(options);
  }

  /**
   * Unrolls a stat die.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when hit die is rolled.
   * @static
   */
  async _unrollStatDie(_event, target) {
    const id = target.dataset.id;
    const parentId = target.dataset.parentId;
    const stat = target.dataset.stat;
    await this.document.items
      .get(parentId)
      ["system"][`${stat}Dice`][id].unrollStatDie();
  }

  /**
   * Gets filtered equipment based on current settings.
   *
   * @param {Array} equipment - Array of equipment to filter.
   * @returns {Array} Filtered equipment array.
   */
  _getFilteredEquipment(equipment = []) {
    return _filterEquipment(
      this.actor,
      equipment,
      this.settings.equipmentFilters,
    );
  }

  /**
   * Gets filtered abilities based on current settings.
   *
   * @param {Array} abilities - Array of abilities to filter.
   * @returns {Array} Filtered abilities array.
   */
  _getFilteredAbilities(abilities = []) {
    return _filterAbilities(
      this.actor,
      abilities,
      this.settings.abilityFilters,
    );
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    if (!this.actor.effectTypes) {
      this.actor.buildEffectTypes();
    }

    const tab = this._activeTab || "classes";
    // TODO: Remove `this._embeds` entirely.
    // TODO: Finish resolving virtual abilities.
    // const basicAbilitiesPower = await getItem("Basic Abilities", "essentials");
    // const basicAbilities = basicAbilitiesPower.abilities;
    this._embeds.effectTypes = {
      ability:
        tab === "abilities"
          ? [
              ...this.actor.abilities,
              // Uncomment when bugs with virtual abilities are all resolved.
              // ...basicAbilities
            ]
          : [],
      attunement: tab === "conditions" ? this.actor.attunements : [],
      consequence: tab === "conditions" ? this.actor.consequences : [],
      fluency: tab === "tradecrafts" ? this.actor.fluencies : [],
      resource: tab === "resources" ? this.actor.resources : [],
    };
    this._embeds.itemTypes = {
      equipment: tab === "inventory" ? this.actor.equipment : [],
      power: tab === "powers" ? this.actor.powers : [],
      rank: tab === "classes" ? this.actor.ranks : [],
    };
    let conditions = Array.from(this.actor.statuses || []);
    // Sort: 'down' first, 'dead' second, rest alphabetical
    conditions.sort((a, b) => {
      if (a === "dead") return -1;
      if (b === "dead") return 1;
      if (a === "unconscious") return b === "dead" ? 1 : -1;
      if (b === "unconscious") return a === "dead" ? -1 : 1;
      if (a === "down") {
        if (b === "dead" || b === "unconscious") return 1;
        return -1;
      }
      if (b === "down") {
        if (a === "dead" || a === "unconscious") return -1;
        return 1;
      }
      return a.localeCompare(b);
    });

    const context = await super._prepareContext(options);
    context.activeTab = this._activeTab;
    context.conditions = conditions;
    context.removableConditions = conditions.filter((c) =>
      this.actor.effectKeys.condition?.has(c),
    );
    context.editable = this.isEditable;
    context.actor = this.actor;
    context.abilities = this._getFilteredAbilities(
      _sortAbilities(this.actor, this._embeds.effectTypes.ability) || [],
    );
    context.resources = this.actor.resources;
    context.equipment = this._getFilteredEquipment(
      _sortEquipment(this.actor, this._embeds.itemTypes.equipment) || [],
    );
    context.powers = this.actor.powers;
    context.species = this.actor.species;
    context.fluencies = this.actor.fluencies;
    context.consequences = this.actor.consequences;
    context.attunements = this.actor.attunements;
    context.ranks = this.actor.ranks;
    context.sidebarOpen = this._sidebarOpen;
    context.tabs = {
      classes: {
        id: "classes",
        group: "primary",
        active: this.tabGroups.primary === "classes",
        cssClass: this.tabGroups.primary === "classes" ? "active" : "",
        label: "Classes",
      },
    };
    context.searchStrings = foundry.utils.deepClone(this._searchStrings);
    context.enrichedNotes = await this._editor(
      this.document.system.sheet.notes,
    );
    context.enrichedSpecialRules = await this._editor(
      this.document.system.wielding.attacker.derived?.system?.specialRules,
    );
    context.settings = this.settings;

    context.conditionProviders = {};

    if (tab === "conditions") {
      for (const condition of Object.keys(CONFIG.TERIOCK.conditions)) {
        context.conditionProviders[condition] = new Set();
        for (const e of this.document.effectTypes?.base || []) {
          if (e.statuses.has(condition) && e.active) {
            context.conditionProviders[condition].add(e.name);
            if (e.name === "2nd Arm Hack") {
              context.conditionProviders[condition].delete("1st Arm Hack");
            }
            if (e.name === "2nd Leg Hack") {
              context.conditionProviders[condition].delete("1st Leg Hack");
            }
            if (e.name === "Heavily Encumbered") {
              context.conditionProviders[condition].delete(
                "Lightly Encumbered",
              );
            }
          }
        }
        for (const c of this.document.conditions) {
          if (
            !c.id.includes(condition) &&
            c.statuses.has(condition) &&
            c.active
          ) {
            context.conditionProviders[condition].add(c.name);
          }
        }
        for (const c of this.document.consequences) {
          if (c.statuses.has(condition) && c.active) {
            context.conditionProviders[condition].add(c.name);
          }
        }
        context.conditionProviders[condition] = Array.from(
          context.conditionProviders[condition],
        );
      }
    }

    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

    /** @type {HTMLDivElement} */
    const sidebar = this.element.querySelector(".character-sidebar");
    /** @type {HTMLDivElement} */
    const tabber = this.element.querySelector(
      ".character-sidebar-tabber-container",
    );
    /** @type {HTMLDivElement} */
    const hitDrawer = this.element.querySelector(".hit-die-drawer");
    /** @type {HTMLDivElement} */
    const manaDrawer = this.element.querySelector(".mana-die-drawer");

    sidebar.classList.add("no-transition");
    tabber.classList.add("no-transition");
    hitDrawer.classList.add("no-transition");
    manaDrawer.classList.add("no-transition");

    sidebar.classList.toggle("collapsed", !this._sidebarOpen);
    tabber.classList.toggle("collapsed", !this._sidebarOpen);
    hitDrawer.classList.toggle("closed", !this._hitDrawerOpen);
    manaDrawer.classList.toggle("closed", !this._manaDrawerOpen);

    sidebar.offsetHeight;
    tabber.offsetHeight;
    hitDrawer.offsetHeight;
    manaDrawer.offsetHeight;

    sidebar.classList.remove("no-transition");
    tabber.classList.remove("no-transition");
    hitDrawer.classList.remove("no-transition");
    manaDrawer.classList.remove("no-transition");

    this.element.querySelectorAll(".character-tabber").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        /** @type {HTMLElement} */
        const currentTarget = e.currentTarget;
        const tab = currentTarget.dataset.tab;
        if (tab === "sidebar") {
          sidebar.classList.toggle("collapsed");
          tabber.classList.toggle("collapsed");
          this._sidebarOpen = !this._sidebarOpen;
        } else {
          this._activeTab = tab;
          await this.render();
        }
        e.stopPropagation();
      });
    });

    this.element
      .querySelectorAll(".character-hit-bar-overlay-row")
      .forEach((el) => {
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          hitDrawer.classList.toggle("closed");
          this._hitDrawerOpen = !this._hitDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element
      .querySelectorAll(".character-mana-bar-overlay-row")
      .forEach((el) => {
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          manaDrawer.classList.toggle("closed");
          this._manaDrawerOpen = !this._manaDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element.querySelectorAll("[data-action=rollStatDie]").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        await this._unrollStatDie(e, target);
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll(".ch-attribute-save-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) return;
        const attr = el.dataset.attribute;
        const current = this.document.system.attributes[attr].saveFluent;
        await this.document.update({
          [`system.attributes.${attr}.saveFluent`]: !current,
        });
        e.stopPropagation();
      });
    });

    this.element
      .querySelector(".character-penalty-box")
      .addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        await this.document.update({ "system.attackPenalty": 0 });
        e.stopPropagation();
      });

    this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) return;
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ el.dataset
            .part;
        await this.actor.takeUnhack(part);
        e.stopPropagation();
      });
    });

    this.element
      .querySelector(".character-name")
      ?.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        console.log("Debug", this.document, this);
        e.stopPropagation();
      });

    primaryBlockerContextMenu(this.actor, this._dynamicContextMenus.blocker);
    primaryAttackContextMenu(this.actor, this._dynamicContextMenus.attacker);

    this._connectContextMenu(
      ".character-primary-blocker-select",
      this._dynamicContextMenus.blocker,
      "click",
    );
    this._connectContextMenu(
      ".character-primary-attacker-select",
      this._dynamicContextMenus.attacker,
      "click",
    );
    this._connectContextMenu(
      ".character-piercing-box",
      piercingContextMenu(this.actor),
      "click",
    );

    _initSearchFilters(this);

    /** @type {NodeListOf<HTMLSelectElement>} */
    const filterSelects = this.element.querySelectorAll(
      'select[name^="settings.abilityFilters"], select[name^="settings.equipmentFilters"]',
    );
    filterSelects.forEach((el) => {
      el.addEventListener("change", async (e) => {
        /** @type {HTMLSelectElement} */
        const filterSelect = e.target;
        const name = filterSelect.name;
        if (!name) return;
        const path = name.split(".").slice(1);
        let obj = this.settings;
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = e.target.value;
        await this.render();
      });
    });

    /** @type {NodeListOf<HTMLButtonElement>} */
    const toggleSwitches = this.element.querySelectorAll(
      'button[data-action="toggleSwitch"]',
    );
    toggleSwitches.forEach((el) => {
      // Left click: forward cycle
      el.addEventListener("click", async () => {
        this.#cycleToggleSwitch(el, true);
        await this.render();
      });
      // Right click: reverse cycle
      el.addEventListener("contextmenu", async () => {
        this.#cycleToggleSwitch(el, false);
        await this.render();
      });
    });
  }

  /**
   * Cycle the value of a three-way switch either forwards or backwards.
   *
   * @param {HTMLButtonElement} toggleSwitch
   * @param {boolean} forward
   * @private
   */
  #cycleToggleSwitch(toggleSwitch, forward = true) {
    const name = toggleSwitch.getAttribute("data-name");
    if (!name) return;
    const path = name.split(".").slice(1);
    let obj = this.settings;
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    const key = path[path.length - 1];
    const val = obj[key];
    if (forward) {
      obj[key] = ((val + 2) % 3) - 1;
    } else {
      obj[key] = ((val + 3) % 3) - 1;
    }
  }
}
