const { api, ux } = foundry.applications;
import { conditions } from "../../../../content/conditions.mjs";
import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import { copyRank, getItem, getRank } from "../../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../../helpers/utils.mjs";
import { selectClassDialog, selectDialog, selectEquipmentTypeDialog } from "../../../dialogs/select-dialog.mjs";
import { BaseActorSheet } from "../../_base.mjs";
import {
  piercingContextMenu,
  primaryAttackContextMenu,
  primaryBlockerContextMenu
} from "./connections/character-context-menus.mjs";
import { _filterAbilities, _filterEquipment } from "./methods/_filters.mjs";
import { _defaultSheetSettings } from "./methods/_settings.mjs";
import { _sortAbilities, _sortEquipment } from "./methods/_sort.mjs";

/**
 * Base actor sheet for actors.
 * Provides comprehensive character management including abilities, equipment, tradecrafts,
 * and various interactive features like rolling, damage tracking, and condition management.
 *
 * @property{TeriockActor} actor
 */
export default class TeriockBaseActorSheet extends BaseActorSheet {
  /**
   * Default options for the base actor sheet.
   *
   * @type {object}
   * @static
   */
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
      openPrimaryAttacker: this._openPrimaryAttacker,
      openPrimaryBlocker: this._openPrimaryBlocker,
      quickUse: this._quickUse,
      removeCondition: this._removeCondition,
      resist: this._resist,
      rollFeatSave: this._rollFeatSave,
      rollHitDie: this._rollHitDie,
      rollManaDie: this._rollManaDie,
      rollTradecraft: this._rollTradecraft,
      takeDamage: this._takeDamage,
      takeDrain: this._takeDrain,
      takeHack: this._takeHack,
      takeWither: this._takeWither,
      toggleConditionExpansion: this._toggleConditionExpansion,
      toggleDisabledDoc: this._toggleDisabledDoc,
      toggleEquippedDoc: this._toggleEquippedDoc,
      toggleSb: this._toggleSb,
      tradecraftExtra: this._tradecraftExtra,
    },
    form: {
      submitOnChange: true,
    },
    position: { width: 800, height: 600 },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
    },
  };

  /**
   * Template parts configuration for the sheet.
   * @type {object}
   * @static
   */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/actor-templates/character-template/character-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };

  /**
   * Search configurations for different document types.
   *
   * @type {Array}
   * @static
   */
  static SEARCH_CONFIGS = [
    { type: "ability", source: "effectTypes", method: "_getFilteredAbilities" },
    { type: "equipment", source: "itemTypes", method: "_getFilteredEquipment" },
    { type: "fluency", source: "effectTypes", method: null },
    { type: "power", source: "itemTypes", method: null },
    { type: "rank", source: "itemTypes", method: null },
    { type: "resource", source: "effectTypes", method: null },
    { type: "consequence", source: "effectTypes", method: null },
  ];

  /**
   * Creates a new base actor sheet instance.
   * Initializes sheet state including menus, drawers, search values, and settings.
   *
   * @param {...any} args - Arguments to pass to the parent constructor.
   */
  constructor(...args) {
    super(...args);
    this._filterMenuOpen = false;
    this._displayMenuOpen = false;
    this._sidebarOpen = true;
    this._hitDrawerOpen = true;
    this._manaDrawerOpen = true;
    this._locked = false;
    this._dynamicContextMenus = {
      attacker: [],
      blocker: [],
    };
    this._loadingSearch = true;
    this._abilitySearchValue = "";
    this._equipmentSearchValue = "";
    this._powerSearchValue = "";
    this._fluencySearchValue = "";
    this._consequenceSearchValue = "";
    this._rankSearchValue = "";
    this._resourceSearchValue = "";
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
  }

  /**
   * Toggles the equipped state of an embedded document.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleEquippedDoc(event, target) {
    const embedded =
      /** @type {TeriockEquipment|null} */
      await this._embeddedFromCard(target);
    if (embedded.system.equipped) {
      await embedded.system.unequip();
    } else {
      await embedded.system.equip();
    }
  }

  /**
   * Toggles the disabled state of an embedded document.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when toggle is complete.
   * @static
   */
  static async _toggleDisabledDoc(event, target) {
    const embedded = await this._embeddedFromCard(target);
    embedded?.toggleDisabled();
  }

  /**
   * Adds a new embedded document to the actor.
   * Creates documents based on the specified tab type.
   *
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when document is created.
   * @static
   */
  static async _addEmbedded(_event, target) {
    const tab = target.dataset.tab;
    const tabMap = {
      ability: {
        data: {
          img: "systems/teriock/assets/ability.svg",
          name: "New Ability",
          type: "ability",
        },
        docType: "ActiveEffect",
      },
      consequence: {
        data: {
          img: "systems/teriock/assets/effect.svg",
          name: "New Consequence",
          type: "consequence",
        },
        docType: "ActiveEffect",
      },
      equipment: {
        data: {
          img: "systems/teriock/assets/equipment.svg",
          name: "New Equipment",
          type: "equipment",
        },
        docType: "Item",
      },
      fluency: {
        data: {
          img: "systems/teriock/assets/fluency.svg",
          name: "New Fluency",
          type: "fluency",
        },
        docType: "ActiveEffect",
      },
      power: {
        data: {
          img: "systems/teriock/assets/power.svg",
          name: "New Power",
          type: "power",
        },
        docType: "Item",
      },
      rank: {
        data: {
          img: "systems/teriock/assets/rank.svg",
          name: "New Rank",
          type: "rank",
        },
        docType: "Item",
      },
      resource: {
        data: {
          img: "systems/teriock/assets/resource.svg",
          name: "New Resource",
          type: "resource",
        },
        docType: "ActiveEffect",
      },
    };
    const entry = tabMap[tab];
    if (!entry) return;
    /** @type {(Document|ClientDocument)[]} */
    const docs = await this.actor.createEmbeddedDocuments(entry.docType, [
      entry.data,
    ]);
    await docs[0].sheet?.render(true);
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
    const rankClass = await selectClassDialog();
    if (!rankClass) return;
    const rankNumber = Number(
      await selectDialog(
        { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
        {
          label: "Rank",
          hint: `What rank ${CONFIG.TERIOCK.rankOptionsList[rankClass]} is this?`,
          title: "Select Rank",
        },
      ),
    );
    if (!rankClass) return;
    const referenceRank = await getRank(rankClass, rankNumber);
    console.log(referenceRank);
    let rank = await copyRank(rankClass, rankNumber);
    if (rankNumber <= 2) {
      await this.document.createEmbeddedDocuments("Item", [rank]);
      return;
    }
    const existingRanks = this.document.ranks.filter(
      (r) => r.system.className === rankClass,
    );
    console.log(rank.abilities.filter((a) => !a.sup));
    const combatAbilityNames = new Set(
      referenceRank.abilities
        .filter((a) => !a.sup)
        .map((a) => a.name)
        .slice(0, 3),
    );
    const availableCombatAbilityNames = new Set(combatAbilityNames);
    const supportAbilityNames = new Set(
      referenceRank.abilities
        .filter((a) => !a.sup)
        .map((a) => a.name)
        .slice(3),
    );
    const availableSupportAbilityNames = new Set(supportAbilityNames);
    for (const existingRank of existingRanks) {
      for (const ability of existingRank.abilities) {
        const existingAbility = rank.abilities.find(
          (a) => a.name === ability.name,
        );
        if (existingAbility) {
          availableCombatAbilityNames.delete(existingAbility.name);
          availableSupportAbilityNames.delete(existingAbility.name);
        }
      }
    }
    const chosenAbilityNames = [];
    if (availableCombatAbilityNames.size > 1) {
      const combatAbilityChoices = {};
      availableCombatAbilityNames.map((n) => (combatAbilityChoices[n] = n));
      const chosenCombatAbilityName = await selectDialog(combatAbilityChoices, {
        label: "Ability",
        hint: "Select a combat ability.",
        title: "Select Combat Ability",
      });
      chosenAbilityNames.push(chosenCombatAbilityName);
    } else {
      chosenAbilityNames.push(...availableCombatAbilityNames);
    }
    if (availableSupportAbilityNames.size > 1) {
      const supportAbilityChoices = {};
      availableSupportAbilityNames.map((n) => (supportAbilityChoices[n] = n));
      const supportAbilityName = await selectDialog(supportAbilityChoices, {
        label: "Support Ability",
        hint: "Select a support ability.",
        title: "Select Combat Ability",
      });
      chosenAbilityNames.push(supportAbilityName);
    } else {
      chosenAbilityNames.push(...availableSupportAbilityNames);
    }
    const abilities = rank.effects;
    const allowedAbilityIds = new Set();
    for (const chosenAbilityName of chosenAbilityNames) {
      /** @type {TeriockAbility} */
      const chosenAbility = abilities.getName(chosenAbilityName);
      allowedAbilityIds.add(chosenAbility.id);
      chosenAbility.allSubs.map((a) => allowedAbilityIds.add(a.id));
    }
    for (const ability of abilities) {
      if (!allowedAbilityIds.has(ability.id)) abilities.delete(ability.id);
    }
    await this.document.createEmbeddedDocuments("Item", [rank]);
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
    let equipmentType = await selectEquipmentTypeDialog();
    if (Object.keys(CONFIG.TERIOCK.equipmentType).includes(equipmentType)) {
      const equipment = await getItem(
        CONFIG.TERIOCK.equipmentType[equipmentType],
        "equipment",
      );
      await this.document.createEmbeddedDocuments("Item", [equipment]);
    } else {
      equipmentType = toTitleCase(equipmentType);
      await this.document.createEmbeddedDocuments("Item", [
        {
          name: equipmentType,
          system: {
            equipmentType: equipmentType,
          },
          type: "equipment",
        },
      ]);
    }
  }

  /**
   * Cycles through tradecraft extra levels (0, 1, 2).
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when tradecraft extra is updated.
   * @static
   */
  static async _tradecraftExtra(event, target) {
    const tradecraft = target.dataset.tradecraft;
    const extra = this.document.system.tradecrafts[tradecraft].extra;
    const newExtra = (extra + 1) % 3;
    await this.document.update({
      [`system.tradecrafts.${tradecraft}.extra`]: newExtra,
    });
  }

  /**
   * Rolls a hit die for a rank item.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when hit die is rolled.
   * @static
   */
  static async _rollHitDie(event, target) {
    const id = target.dataset.id;
    /** @type TeriockRank */
    const rank = this.actor.items.get(id);
    if (rank) await rank.system.rollHitDie();
  }

  /**
   * Rolls a mana die for a rank item.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when mana die is rolled.
   * @static
   */
  static async _rollManaDie(event, target) {
    const id = target.dataset.id;
    /** @type {TeriockRank} */
    const rank = this.actor.items.get(id);
    if (rank) await rank.system.rollManaDie();
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
   * Toggles the shield bash (sb) state.
   *
   * @returns {Promise<void>} Promise that resolves when sb is toggled.
   * @static
   */
  static async _toggleSb() {
    await this.document.update({ "system.sb": !this.document.system.sb });
  }

  /**
   * Opens the primary attacker's sheet.
   *
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when sheet is opened.
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
   * @returns {Promise<void>} Promise that resolves when sheet is opened.
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
        callback: (event, button) => {
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
        callback: (event, button) => {
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
        callback: (event, button) => {
          let input = button.form.elements.namedItem("wither").value;
          if (input) {
            this.document.takeWither(Number(input));
          }
        },
      },
    });
  }

  /**
   * Removes a condition with optional modifiers.
   *
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when condition is removed.
   * @static
   */
  static async _removeCondition(event, target) {
    event.stopPropagation();
    const options = {};
    const condition = target.dataset.condition;
    if (event.altKey) options.increaseDie = true;
    if (event.shiftKey) options.decreaseDie = true;
    if (event.ctrlKey) options.skip = true;
    await this.actor.rollCondition(condition, options);
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

  static async _toggleConditionExpansion(event, target) {
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
    const part = /** @type {Teriock.HackableBodyPart} */ target.dataset.part;
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
    /** @type {Teriock.CommonRollOptions} */
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
    /** @type {Teriock.CommonRollOptions} */
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

  /**
   * Prepares the context data for template rendering.
   * Builds effect types, sorts data, and prepares all necessary context information.
   *
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    if (!this.actor.effectTypes) {
      this.actor.buildEffectTypes();
    }
    const tab = this._activeTab || "classes";
    this._embeds.effectTypes = {
      ability: tab === "abilities" ? this.actor.abilities : [],
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
    context.abilities = _sortAbilities(this.actor) || [];
    context.resources = this.actor.resources;
    context.equipment = _sortEquipment(this.actor) || [];
    context.powers = this.actor.powers;
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
    context.enrichedNotes = await this._editor(
      this.document.system.sheet.notes,
    );
    context.enrichedSpecialRules = await this._editor(
      this.document.system.wielding.attacker.derived?.system?.specialRules,
    );
    context.settings = this.settings;

    return context;
  }

  /**
   * Gets an ability by ID and optional parent ID.
   *
   * @param {string} id - The ability ID.
   * @param {string} parentId - The optional parent ID.
   * @returns {ActiveEffect|null} The ability effect or null if not found.
   */
  _getAbility(id, parentId) {
    return parentId
      ? this.actor.items.get(parentId)?.effects.get(id)
      : this.actor.effects.get(id);
  }

  /**
   * Handles the render event for the actor sheet.
   * Sets up UI state, event listeners, and context menus.
   *
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
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

    this.element.querySelectorAll(".die-box").forEach((el) => {
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) return;
        const id = el.dataset.id;
        /** @type {TeriockRank} */
        const rank = this.actor.items.get(id);
        const die = el.dataset.die;
        if (die === "hit") {
          rank.update({ "system.hitDieSpent": !rank.system.hitDieSpent });
        } else if (die === "mana") {
          rank.update({ "system.manaDieSpent": !rank.system.manaDieSpent });
        }
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

    this.element.querySelectorAll(".condition-toggle").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) return;
        const condition = el.dataset.condition;
        await this.actor.rollCondition(condition, { skip: true });
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) return;
        const part = /** @type {Teriock.HackableBodyPart} */ el.dataset.part;
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

    this._loadingSearch = true;
    this.#runSearchFilters();
    this.#initSearchFilters();

    /** @type {NodeListOf<HTMLInputElement>} */
    const searchInputs = this.element.querySelectorAll(".tcard-search");
    searchInputs.forEach((input) => {
      input.value = this[`_${input.dataset.type}SearchValue`];
    });

    // Add listeners for filter selects

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

  /**
   * Initializes search filters for all document types.
   *
   * @private
   */
  #initSearchFilters() {
    const configs = this.constructor.SEARCH_CONFIGS;
    configs.forEach(({ type, source, method }) => {
      const contentEl = this.element.querySelector(`#${type}-results`);
      const inputEl = this.element.querySelector(`.${type}-search`);
      if (!(contentEl && inputEl)) return;

      const instance = new ux.SearchFilter({
        callback: (event, query, rgx) => {
          if (!query && this._loadingSearch) {
            const searchPath = `_${type}SearchValue`;
            const value = this[searchPath] || "";
            rgx = new RegExp(value, "i");
          }
          this.#handleSearchFilter(
            type,
            source,
            method,
            rgx,
            contentEl,
            inputEl,
          );
        },
        contentSelector: `#${type}-results`,
        inputSelector: `.${type}-search`,
      });

      instance.bind(this.element);

      inputEl.addEventListener("focus", () => {
        this._loadingSearch = false;
      });
    });
  }

  /**
   * Runs search filters for all document types.
   *
   * @private
   */
  #runSearchFilters() {
    const configs = this.constructor.SEARCH_CONFIGS;
    configs.forEach(({ type, source, method }) => {
      const contentEl = this.element.querySelector(`#${type}-results`);
      if (!contentEl) return;

      const inputValue = this[`_${type}SearchValue`] || "";
      const rgx = new RegExp(inputValue, "i");
      this.#applyFilter(type, source, method, rgx, contentEl);
    });
  }

  /**
   * Handles search filter changes for a specific type.
   *
   * @param {string} type - The document type.
   * @param {string} sourceKey - The source key for the data.
   * @param {string|null} filterMethodName - The filter method name.
   * @param {RegExp} rgx - The search regex.
   * @param {HTMLElement} content - The content element.
   * @param {HTMLInputElement} input - The input element.
   * @private
   */
  #handleSearchFilter(type, sourceKey, filterMethodName, rgx, content, input) {
    this.#applyFilter(type, sourceKey, filterMethodName, rgx, content);
    const searchPath = `_${type}SearchValue`;
    if (!input) {
      return;
    }
    this[searchPath] = input.value;
    this._loadingSearch = false;
  }

  /**
   * Applies a filter to content elements.
   *
   * @param {string} type - The document type.
   * @param {string} sourceKey - The source key for the data.
   * @param {string|null} filterMethodName - The filter method name.
   * @param {RegExp} rgx - The search regex.
   * @param {HTMLElement} content - The content element.
   * @private
   */
  #applyFilter(type, sourceKey, filterMethodName, rgx, content) {
    const noResults = this.element.querySelector(".no-results");
    let filtered = this._embeds[sourceKey][type] || [];
    if (filterMethodName) {
      filtered = this[filterMethodName]?.(filtered) || filtered;
    }
    filtered = filtered.filter((i) => rgx.test(i.name));

    const visibleIds = new Set(filtered.map((i) => i._id));
    const allCards = Array.from(content?.querySelectorAll(".tcard") || []);

    let visibleCount = 0;
    let firstVisibleCard = null;
    let lastVisibleCard = null;

    allCards.forEach((card) => {
      const isVisible = visibleIds.has(card.dataset.id);

      card.classList.remove("visible-first", "visible-last");
      card.classList.toggle("hidden", !isVisible);

      if (isVisible) {
        visibleCount++;
        if (!firstVisibleCard) firstVisibleCard = card;
        lastVisibleCard = card;
      }
    });

    if (firstVisibleCard) firstVisibleCard.classList.add("visible-first");
    if (lastVisibleCard) lastVisibleCard.classList.add("visible-last");
    if (noResults) {
      noResults.classList.toggle("not-hidden", visibleCount === 0);
    }
  }
}
