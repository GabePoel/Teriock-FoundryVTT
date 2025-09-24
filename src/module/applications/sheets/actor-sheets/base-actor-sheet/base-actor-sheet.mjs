import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { tradecraftMessage } from "../../../../helpers/html.mjs";
import { buildMessage } from "../../../../helpers/messages-builder/message-builder.mjs";
import { docSort } from "../../../../helpers/utils.mjs";
import {
  changeSizeDialog,
  selectDocumentDialog,
} from "../../../dialogs/_module.mjs";
import { HackStatMixin } from "../../../shared/mixins/_module.mjs";
import { CommonSheetMixin } from "../../mixins/_module.mjs";
import _embeddedFromCard from "../../mixins/common-sheet-mixin/methods/_embedded-from-card.mjs";
import { piercingContextMenu } from "./connections/character-context-menus.mjs";
import {
  _addEmbedded,
  _addEquipment,
  _addRank,
} from "./methods/_add-embedded.mjs";
import { _filterAbilities, _filterEquipment } from "./methods/_filters.mjs";
import { _initSearchFilters } from "./methods/_search.mjs";
import { _defaultSheetSettings } from "./methods/_settings.mjs";
import { _sortAbilities, _sortEquipment } from "./methods/_sort.mjs";

const { DialogV2 } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Base actor sheet for actorsUuids.
 * Provides comprehensive character management including abilities, equipment, tradecrafts,
 * and various interactive features like rolling, damage tracking, and condition management.
 * @extends {ActorSheetV2}
 * @mixes HackStatMixin
 * @mixes CommonSheetMixin
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockBaseActorSheet extends HackStatMixin(
  CommonSheetMixin(ActorSheetV2),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "character"],
    actions: {
      addEmbedded: this._addEmbedded,
      addEquipment: this._addEquipment,
      addRank: this._addRank,
      attack: this._attack,
      deathBagPull: this._deathBagPull,
      deattuneDoc: this._deattuneDoc,
      endCondition: this._endCondition,
      immune: this._immune,
      openMechanics: this._openMechanics,
      openPrimaryAttacker: this._openPrimaryAttacker,
      openPrimaryBlocker: this._openPrimaryBlocker,
      quickUse: this._quickUse,
      rollFeatSave: this._rollFeatSave,
      rollResistance: this._rollResistance,
      rollStatDie: this._rollStatDie,
      rollTradecraft: this._rollTradecraft,
      selectAttacker: this._selectAttacker,
      selectBlocker: this._selectBlocker,
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
      toggleReaction: this._toggleReaction,
      toggleSb: this._toggleSb,
      toggleShatteredDoc: this._toggleShatteredDoc,
      tradecraftExtra: this._tradecraftExtra,
    },
    position: {
      width: 800,
      height: 600,
    },
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
   * @param {...any} args - Arguments to pass to the parent constructor.
   */
  constructor(...args) {
    super(...args);
    this._sidebarOpen = true;
    this._hpDrawerOpen = true;
    this._mpDrawerOpen = true;
    this._locked = false;
    this._embeds = {
      effectTypes: {},
      itemTypes: {},
    };
    this._activeTab = "tradecrafts";
    const sheetSettings = _defaultSheetSettings;
    Object.keys(TERIOCK.content.conditions).forEach((key) => {
      sheetSettings.conditionExpansions[key] = false;
    });
    this.settings = _defaultSheetSettings;

    /** @type {Record<string, string>} */
    this._searchStrings = {};
  }

  /**
   * Adds a new embedded document to the actor.
   * Creates documents based on the specified tab type.
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when the document is created.
   * @static
   */
  static async _addEmbedded(_event, target) {
    await _addEmbedded(this, target);
  }

  /**
   * Adds a {@link TeriockEquipment} to the {@link TeriockActor}.
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} _target - The event target.
   * @returns {Promise<void>}
   * @private
   */
  static async _addEquipment(_event, _target) {
    await _addEquipment(this);
  }

  /**
   * Adds a {@link TeriockRank} to the {@link TeriockActor}.
   * @param {MouseEvent} _event - The event object.
   * @param {HTMLElement} _target - The event target.
   * @returns {Promise<void>} Promise that resolves when the {@link TeriockRank} is added.
   * @private
   */
  static async _addRank(_event, _target) {
    await _addRank(this);
  }

  /**
   * Performs a basic attack with optional advantage/disadvantage.
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
   * Pull from the Death Bag.
   * @returns {Promise<void>}
   * @static
   */
  static async _deathBagPull() {
    await this.actor.system.deathBagPull();
  }

  /**
   * Deattunes an attunement effect.
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

  /**
   * Ends a condition with optional advantage/disadvantage.
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
   * Rolls immunity with optional advantage/disadvantage.
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when immunity is rolled.
   * @static
   */
  static async _immune(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const messageParts = {};
      const tcard = target.closest(".tcard");
      const img = target.querySelector("img");
      messageParts.image = img.src;
      messageParts.name = "Immunity";
      messageParts.bars = [
        {
          icon: "fa-shield",
          label: "Immunity",
          wrappers: [
            tcard.querySelector(".tcard-title").textContent,
            tcard.querySelector(".tcard-subtitle").textContent,
          ],
        },
      ];
      messageParts.blocks = [
        {
          title: "Immunity",
          text: TERIOCK.content.keywords.immunity,
        },
      ];
      const content = buildMessage(messageParts).outerHTML;
      message = await TextEditor.enrichHTML(
        `<div class="teriock">${content}</div>`,
      );
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
   * Opens the mechanics sheet.
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
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when the sheet is opened.
   * @static
   */
  static async _openPrimaryAttacker(event) {
    event.stopPropagation();
    await this.document.system.primaryAttacker?.sheet.render(true);
  }

  /**
   * Opens the primary blocker's sheet.
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when the sheet is opened.
   * @static
   */
  static async _openPrimaryBlocker(event) {
    event.stopPropagation();
    await this.document.system.primaryBlocker?.sheet.render(true);
  }

  /**
   * Quickly uses an item with optional modifiers.
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
      if (event.altKey) {
        options.advantage = true;
      }
      if (event.shiftKey) {
        options.disadvantage = true;
      }
      if (event.ctrlKey) {
        options.twoHanded = true;
      }
      await item.use(options);
    }
  }

  /**
   * Rolls a feat save with optional advantage/disadvantage.
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when feat save is rolled.
   * @static
   */
  static async _rollFeatSave(event, target) {
    const attribute = target.dataset.attribute;
    const options = {};
    if (event.altKey) {
      options.advantage = true;
    }
    if (event.shiftKey) {
      options.disadvantage = true;
    }
    await this.actor.rollFeatSave(attribute, options);
  }

  /**
   * Rolls resistance with optional advantage/disadvantage.
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when resistance is rolled.
   * @static
   */
  static async _rollResistance(event, target) {
    event.stopPropagation();
    let message = null;
    /** @type {Teriock.MessageData.MessageParts} */
    if (target.classList.contains("tcard-image")) {
      const messageParts = {};
      const tcard = target.closest(".tcard");
      const img = target.querySelector("img");
      messageParts.image = img.src;
      messageParts.name = "Resistance";
      messageParts.bars = [
        {
          icon: "fa-shield",
          label: "Resistance",
          wrappers: [
            tcard.querySelector(".tcard-title").textContent,
            tcard.querySelector(".tcard-subtitle").textContent,
          ],
        },
      ];
      messageParts.blocks = [
        {
          title: "Resistance",
          text: TERIOCK.content.keywords.resistance,
        },
      ];
      const content = buildMessage(messageParts).outerHTML;
      message = await TextEditor.enrichHTML(
        `<div class="teriock">${content}</div>`,
      );
    }
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    await this.actor.rollResistance(options);
  }

  /**
   * Rolls a tradecraft check with optional advantage/disadvantage.
   * @param {MouseEvent} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when tradecraft is rolled.
   * @static
   */
  static async _rollTradecraft(event, target) {
    const tradecraft = target.dataset.tradecraft;
    const options = {};
    if (event.altKey) {
      options.advantage = true;
    }
    if (event.shiftKey) {
      options.disadvantage = true;
    }
    await this.actor.rollTradecraft(tradecraft, options);
  }

  /**
   * Select a primary attacker.
   * @returns {Promise<void>}
   * @private
   */
  static async _selectAttacker() {
    const attacker = await selectDocumentDialog(
      this.document.equipment.filter((e) => e.system.isEquipped),
      {
        hint: "Select the default equipment you attack with.",
        label: "Select Primary Attacker",
      },
    );
    if (attacker) {
      await this.document.update({
        "system.wielding.attacker": attacker.id,
      });
    }
  }

  /**
   * Select a primary blocker.
   * @returns {Promise<void>}
   * @private
   */
  static async _selectBlocker() {
    const attacker = await selectDocumentDialog(
      this.document.equipment.filter((e) => e.system.isEquipped),
      {
        hint: "Select the default equipment you block with.",
        label: "Select Primary Blocker",
      },
    );
    if (attacker) {
      await this.document.update({
        "system.wielding.blocker": attacker.id,
      });
    }
  }

  /**
   * Prompts for damage amount and applies it to the actor.
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   * @static
   */
  static async _takeDamage(event) {
    event.stopPropagation();
    await DialogV2.prompt({
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
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   * @static
   */
  static async _takeDrain(event) {
    event.stopPropagation();
    await DialogV2.prompt({
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
   * @param {MouseEvent} event - The event object.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   * @static
   */
  static async _takeWither(event) {
    event.stopPropagation();
    await DialogV2.prompt({
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
   * Toggles the attuned state of an embedded document.
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
   * Toggles the dampened state of an embedded document.
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
   * Toggles the disabled state of an embedded document.
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
   * Toggles the equipped state of an embedded document.
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
   * Toggles the glued state of an embedded document.
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
   * Toggles if the character still has a reaction.
   * @returns {Promise<void>} Promise that resolves when sb is toggled.
   * @static
   */
  static async _toggleReaction() {
    await this.document.update({
      "system.combat.hasReaction": !this.document.system.combat.hasReaction,
    });
  }

  /**
   * Toggles the style bonus (sb) state.
   * @returns {Promise<void>} Promise that resolves when sb is toggled.
   * @static
   */
  static async _toggleSb() {
    await this.document.update({
      "system.offense.sb": !this.document.system.offense.sb,
    });
  }

  /**
   * Toggles the shattered state of an embedded document.
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
   * Cycles through tradecraft extra levels (0, 1, 2).
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
   * Cycle the value of a three-way switch either forwards or backwards.
   * @param {HTMLButtonElement} toggleSwitch
   * @param {boolean} forward
   * @private
   */
  #cycleToggleSwitch(toggleSwitch, forward = true) {
    const name = toggleSwitch.getAttribute("data-name");
    if (!name) {
      return;
    }
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

  /** @inheritDoc */
  _canDrop(doc) {
    if (doc.type === "ability") {
      return false;
    } else {
      return super._canDrop(doc);
    }
  }

  /**
   * Gets filtered abilities based on current settings.
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
   * Gets filtered equipment based on current settings.
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

  /** @inheritDoc */
  async _onDropItem(event, data) {
    const item = await super._onDropItem(event, data);
    if (item?.type === "species") {
      await changeSizeDialog(this.actor, item);
    }
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      foundry.ui.notifications.warn(
        `${this.document.name} has no species. Add one from the "Species" compendium.`,
      );
    }
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
    const hpDrawer = this.element.querySelector(".hp-die-drawer");
    /** @type {HTMLDivElement} */
    const mpDrawer = this.element.querySelector(".mp-die-drawer");

    sidebar.classList.add("no-transition");
    tabber.classList.add("no-transition");
    hpDrawer.classList.add("no-transition");
    mpDrawer.classList.add("no-transition");

    sidebar.classList.toggle("collapsed", !this._sidebarOpen);
    tabber.classList.toggle("collapsed", !this._sidebarOpen);
    hpDrawer.classList.toggle("closed", !this._hpDrawerOpen);
    mpDrawer.classList.toggle("closed", !this._mpDrawerOpen);

    //eslint-disable-next-line @typescript-eslint/no-unused-expressions
    sidebar.offsetHeight;
    //eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tabber.offsetHeight;
    //eslint-disable-next-line @typescript-eslint/no-unused-expressions
    hpDrawer.offsetHeight;
    //eslint-disable-next-line @typescript-eslint/no-unused-expressions
    mpDrawer.offsetHeight;

    sidebar.classList.remove("no-transition");
    tabber.classList.remove("no-transition");
    hpDrawer.classList.remove("no-transition");
    mpDrawer.classList.remove("no-transition");

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
          hpDrawer.classList.toggle("closed");
          this._hpDrawerOpen = !this._hpDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element
      .querySelectorAll(".character-mana-bar-overlay-row")
      .forEach((el) => {
        el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          mpDrawer.classList.toggle("closed");
          this._mpDrawerOpen = !this._mpDrawerOpen;
          e.stopPropagation();
        });
      });

    this.element.querySelectorAll(".ch-attribute-save-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) {
          return;
        }
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
        await this.document.update({ "system.combat.attackPenalty": 0 });
        e.stopPropagation();
      });

    this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        if (!(el instanceof HTMLElement)) {
          return;
        }
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
        if (!name) {
          return;
        }
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
    let conditions = Array.from(this.actor.statuses || []).filter((c) =>
      Object.keys(TERIOCK.index.conditions).includes(c),
    );
    // Sort: 'down' first, 'dead' second, rest alphabetical
    conditions.sort((a, b) => {
      if (a === "dead") {
        return -1;
      }
      if (b === "dead") {
        return 1;
      }
      if (a === "unconscious") {
        return b === "dead" ? 1 : -1;
      }
      if (b === "unconscious") {
        return a === "dead" ? -1 : 1;
      }
      if (a === "down") {
        if (b === "dead" || b === "unconscious") {
          return 1;
        }
        return -1;
      }
      if (b === "down") {
        if (a === "dead" || a === "unconscious") {
          return -1;
        }
        return 1;
      }
      return a.localeCompare(b);
    });

    const context = await super._prepareContext(options);
    context.activeTab = this._activeTab;
    context.conditions = conditions;
    context.removableConditions = conditions.filter((c) =>
      this.actor.effectKeys.condition.has(c),
    );
    context.editable = this.isEditable;
    context.actor = this.actor;
    context.abilities = this._getFilteredAbilities(
      _sortAbilities(this.actor, this._embeds.effectTypes.ability) || [],
    );
    context.resources = docSort(this.actor.resources, { alphabetical: true });
    context.equipment = this._getFilteredEquipment(
      _sortEquipment(this.actor, this._embeds.itemTypes.equipment) || [],
    );
    context.powers = docSort(this.actor.powers);
    context.species = docSort(this.actor.species);
    context.fluencies = docSort(this.actor.fluencies);
    context.consequences = docSort(this.actor.consequences, {
      alphabetical: true,
    });
    context.attunements = docSort(this.actor.attunements, {
      alphabetical: true,
    });
    context.ranks = docSort(this.actor.ranks);
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
    context.enrichedNotes = await this._enrich(
      this.document.system.sheet.notes,
    );
    context.enrichedSpecialRules = await this._enrich(
      this.document.system.primaryAttacker?.system?.specialRules,
    );
    context.settings = this.settings;

    context.conditionProviders = {};

    context.tradecraftTooltips = {};
    for (const tc of Object.keys(TERIOCK.index.tradecrafts)) {
      context.tradecraftTooltips[tc] = await tradecraftMessage(tc);
    }

    if (tab === "conditions") {
      for (const condition of Object.keys(TERIOCK.index.conditions)) {
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
}
