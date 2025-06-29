// Allows for typing within mixin.
/** @import ActorSheet from "@client/applications/sheets/actor-sheet.mjs"; */
const { sheets, api, ux } = foundry.applications;
import { _defaultSheetSettings } from "./methods/_settings.mjs";
import { _filterAbilities, _filterEquipment } from "./methods/_filters.mjs";
import { _sortAbilities, _sortEquipment } from "./methods/_sort.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";
import {
  primaryBlockerContextMenu,
  primaryAttackContextMenu,
  piercingContextMenu,
} from "./connections/character-context-menus.mjs";
import { TeriockSheet } from "../../mixins/sheet-mixin.mjs";

/**
 * @extends {ActorSheet}
 */
export default class TeriockBaseActorSheet extends TeriockSheet(sheets.ActorSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["character"],
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
      takeHack: this._takeHack,
      attack: this._attack,
      resist: this._resist,
      immune: this._immune,
      endCondition: this._endCondition,
      deattuneDoc: this._deattuneDoc,
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
      template: "systems/teriock/templates/sheets/character-template/character-template.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };

  static SEARCH_RESULT_PARTIALS = {
    ability: "systems/teriock/templates/sheets/character-template/results/ch-ability-results.hbs",
    equipment: "systems/teriock/templates/sheets/character-template/results/ch-equipment-results.hbs",
    fluency: "systems/teriock/templates/sheets/character-template/results/ch-fluency-results.hbs",
    power: "systems/teriock/templates/sheets/character-template/results/ch-power-results.hbs",
    rank: "systems/teriock/templates/sheets/character-template/results/ch-rank-results.hbs",
    resource: "systems/teriock/templates/sheets/character-template/results/ch-resource-results.hbs",
    effect: "systems/teriock/templates/sheets/character-template/results/ch-effect-results.hbs",
  };

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
    this._effectSearchValue = "";
    this._rankSearchValue = "";
    this._resourceSearchValue = "";
    this._embeds = {
      effectTypes: {},
      itemTypes: {},
    };
    this._activeTab = "tradecrafts";
    this.settings = _defaultSheetSettings;
  }

  static async _toggleEquippedDoc(event, target) {
    this._embeddedFromCard(target)?.system.toggleEquipped();
  }

  static async _toggleDisabledDoc(event, target) {
    this._embeddedFromCard(target)?.toggleDisabled();
  }

  static async _addEmbedded(_, target) {
    const tab = target.dataset.tab;
    const tabMap = {
      ability: {
        docType: "ActiveEffect",
        data: {
          name: "New Ability",
          img: "systems/teriock/assets/ability.svg",
          type: "ability",
        },
      },
      resource: {
        docType: "ActiveEffect",
        data: {
          name: "New Resource",
          img: "systems/teriock/assets/resource.svg",
          type: "resource",
        },
      },
      effect: {
        docType: "ActiveEffect",
        data: {
          name: "New Effect",
          img: "systems/teriock/assets/effect.svg",
          type: "effect",
        },
      },
      equipment: {
        docType: "Item",
        data: {
          name: "New Equipment",
          img: "systems/teriock/assets/equipment.svg",
          type: "equipment",
        },
      },
      power: {
        docType: "Item",
        data: {
          name: "New Power",
          img: "systems/teriock/assets/power.svg",
          type: "power",
        },
      },
      rank: {
        docType: "Item",
        data: {
          name: "New Rank",
          img: "systems/teriock/assets/rank.svg",
          type: "rank",
        },
      },
      fluency: {
        docType: "ActiveEffect",
        data: {
          name: "New Fluency",
          img: "systems/teriock/assets/fluency.svg",
          type: "fluency",
        },
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
      rank.system.rollHitDie();
    }
  }

  static async _rollManaDie(event, target) {
    const id = target.dataset.id;
    const rank = this.actor.items.get(id);
    if (rank) {
      rank.system.rollManaDie();
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
    this.document.update({ "system.sb": !this.document.system.sb });
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
      item.use(options);
    }
  }

  static async _takeDamage(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Damage" },
      content: '<input type="number" name="damage" placeholder="Damage Amount">',
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          let input = button.form.elements.damage.value;
          if (input) {
            this.document.takeDamage(Number(input));
          }
        },
      },
    });
  }

  static async _takeDrain(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Drain" },
      content: '<input type="number" name="drain" placeholder="Drain Amount">',
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          let input = button.form.elements.drain.value;
          if (input) {
            this.document.takeDrain(Number(input));
          }
        },
      },
    });
  }

  static async _takeWither(event, target) {
    event.stopPropagation();
    await api.DialogV2.prompt({
      window: { title: "Take Wither" },
      content: '<input type="number" name="wither" placeholder="Wither Amount">',
      ok: {
        label: "Confirm",
        callback: (event, button, dialog) => {
          let input = button.form.elements.wither.value;
          if (input) {
            this.document.takeWither(Number(input));
          }
        },
      },
    });
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

  static async _deattuneDoc(event, target) {
    event.stopPropagation();
    const attunement = this.actor.effects.get(target.dataset.id);
    if (attunement) {
      await attunement.delete();
    }
  }

  _forceRemoveCondition(condition) {
    this.actor.rollCondition(condition, { skip: true });
  }

  static async _takeHack(event, target) {
    event.stopPropagation();
    const part = target.dataset.part;
    await this.actor.takeHack(part);
  }

  static async _attack(event, target) {
    event.stopPropagation();
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
    };
    this.actor.useAbility("Basic Attack", options);
  }

  static async _resist(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const img = target.querySelector("img");
      if (img) {
        message = img.alt;
      }
    }
    console.log(target);
    console.log(message);
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    this.actor.rollResistance(options);
  }

  static async _immune(event, target) {
    event.stopPropagation();
    let message = null;
    if (target.classList.contains("tcard-image")) {
      const img = target.querySelector("img");
      if (img) {
        message = img.alt;
      }
    }
    console.log(target);
    console.log(message);
    const options = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
      message: message,
    };
    this.actor.rollImmunity(options);
  }

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
    this.actor.endCondition(options);
  }

  _getFilteredEquipment(equipment = []) {
    return _filterEquipment(this.actor, equipment, this.settings.equipmentFilters);
  }

  _getFilteredAbilities(abilities = []) {
    return _filterAbilities(this.actor, abilities, this.settings.abilityFilters);
  }

  /** @override */
  async _prepareContext() {
    if (!this.actor.effectTypes) {
      this.actor.buildEffectTypes();
    }
    const tab = this._activeTab || "classes";
    this._embeds.effectTypes = {
      resource: tab === "resources" ? this.actor.effectTypes.resource : [],
      fluency: tab === "tradecrafts" ? this.actor.effectTypes.fluency : [],
      effect: tab === "conditions" ? this.actor.effectTypes.effect : [],
      attunement: tab === "conditions" ? this.actor.effectTypes.attunement : [],
      ability: tab === "abilities" ? this.actor.effectTypes.ability : [],
    };
    this._embeds.itemTypes = {
      equipment: tab === "inventory" ? this.actor.itemTypes.equipment : [],
      power: tab === "powers" ? this.actor.itemTypes.power : [],
      rank: tab === "classes" ? this.actor.itemTypes.rank : [],
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

    const context = await super._prepareContext();
    context.activeTab = this._activeTab;
    context.conditions = conditions;
    context.editable = this.isEditable;
    context.actor = this.actor;
    context.abilities = _sortAbilities(this.actor) || [];
    context.resources = this.actor.effectTypes.resource || [];
    context.equipment = _sortEquipment(this.actor) || [];
    context.powers = this.actor.itemTypes.power || [];
    context.fluencies = this.actor.effectTypes.fluency || [];
    context.effects = this.actor.effectTypes.effect || [];
    context.attunements = this.actor.effectTypes.attunement || [];
    context.ranks = this.actor.itemTypes.rank || [];
    context.sidebarOpen = this._sidebarOpen;
    context.tabs = {
      classes: {
        cssClass: this.tabGroups.primary === "classes" ? "active" : "",
        group: "primary",
        id: "classes",
        label: "Classes",
      },
    };
    context.enrichedNotes = await this._editor(this.document.system.sheet.notes);
    context.enrichedSpecialRules = await this._editor(this.document.system.primaryAttacker?.system?.specialRules);

    return context;
  }

  _getAbility(id, parentId) {
    return parentId ? this.document.items.get(parentId)?.effects.get(id) : this.document.effects.get(id);
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    const sidebar = this.element.querySelector(".character-sidebar");
    const tabber = this.element.querySelector(".character-sidebar-tabber-container");
    const hitDrawer = this.element.querySelector(".hit-die-drawer");
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
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = e.currentTarget.dataset.tab;
        if (tab === "sidebar") {
          sidebar.classList.toggle("collapsed");
          tabber.classList.toggle("collapsed");
          this._sidebarOpen = !this._sidebarOpen;
        } else {
          this._activeTab = tab;
          this.render();
        }
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll(".character-hit-bar-overlay-row").forEach((el) => {
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        hitDrawer.classList.toggle("closed");
        this._hitDrawerOpen = !this._hitDrawerOpen;
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll(".character-mana-bar-overlay-row").forEach((el) => {
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
        const id = el.dataset.id;
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
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const attr = el.dataset.attribute;
        const current = this.document.system.attributes[attr].saveFluent;
        this.document.update({ [`system.attributes.${attr}.saveFluent`]: !current });
        e.stopPropagation();
      });
    });

    this.element.querySelector(".character-penalty-box").addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.document.update({ "system.attackPenalty": 0 });
      e.stopPropagation();
    });

    this.element.querySelectorAll(".condition-toggle").forEach((el) => {
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const condition = el.dataset.condition;
        this._forceRemoveCondition(condition);
        e.stopPropagation();
      });
    });

    this.element.querySelectorAll(".hack-marker-box").forEach((el) => {
      el.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        const part = el.dataset.part;
        await this.actor.takeUnhack(part);
        e.stopPropagation();
      });
    });

    this.element.querySelector(".character-name")?.addEventListener("contextmenu", async (e) => {
      e.preventDefault();
      console.log("Debug", this.document, this);
      e.stopPropagation();
    });

    primaryBlockerContextMenu(this.actor, this._dynamicContextMenus.blocker);
    primaryAttackContextMenu(this.actor, this._dynamicContextMenus.attacker);

    this._connectContextMenu(".character-primary-blocker-select", this._dynamicContextMenus.blocker, "click");
    this._connectContextMenu(".character-primary-attacker-select", this._dynamicContextMenus.attacker, "click");
    this._connectContextMenu(".character-piercing-box", piercingContextMenu(this.actor), "click");

    this._loadingSearch = true;
    this.#runSearchFilters();
    this.#initSearchFilters();
    this.element.querySelectorAll(".tcard-search").forEach((input) => {
      input.value = this[`_${input.dataset.type}SearchValue`];
    });

    // Add listeners for filter selects
    this.element
      .querySelectorAll('select[name^="settings.abilityFilters"], select[name^="settings.equipmentFilters"]')
      .forEach((el) => {
        el.addEventListener("change", (e) => {
          const name = e.target.name;
          if (!name) return;
          const path = name.split(".").slice(1); // remove 'settings'
          let obj = this.settings;
          for (let i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]];
          }
          obj[path[path.length - 1]] = e.target.value;
          this.render();
        });
      });

    // Add listeners for tswitch buttons
    this.element.querySelectorAll('button[data-action="toggleSwitch"]').forEach((el) => {
      // Left click: forward cycle
      el.addEventListener("click", (e) => {
        const name = el.getAttribute("data-name");
        if (!name) return;
        const path = name.split(".").slice(1); // remove 'settings'
        let obj = this.settings;
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }
        // Three-way toggle: 0 -> 1 -> -1 -> 0
        const key = path[path.length - 1];
        let val = obj[key];
        if (val == 0) {
          obj[key] = 1;
        } else if (val == 1) {
          obj[key] = -1;
        } else {
          obj[key] = 0;
        }
        this.render();
      });
      // Right click: reverse cycle
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const name = el.getAttribute("data-name");
        if (!name) return;
        const path = name.split(".").slice(1); // remove 'settings'
        let obj = this.settings;
        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }
        // Reverse three-way toggle: 0 -> -1 -> 1 -> 0
        const key = path[path.length - 1];
        let val = obj[key];
        if (val == 0) {
          obj[key] = -1;
        } else if (val == -1) {
          obj[key] = 1;
        } else {
          obj[key] = 0;
        }
        this.render();
      });
    });
  }

  static SEARCH_CONFIGS = [
    { type: "ability", source: "effectTypes", method: "_getFilteredAbilities" },
    { type: "equipment", source: "itemTypes", method: "_getFilteredEquipment" },
    { type: "fluency", source: "effectTypes", method: null },
    { type: "power", source: "itemTypes", method: null },
    { type: "rank", source: "itemTypes", method: null },
    { type: "resource", source: "effectTypes", method: null },
    { type: "effect", source: "effectTypes", method: null },
  ];

  /** @private */
  #initSearchFilters() {
    const configs = this.constructor.SEARCH_CONFIGS;
    configs.forEach(({ type, source, method }) => {
      const contentEl = this.element.querySelector(`#${type}-results`);
      const inputEl = this.element.querySelector(`.${type}-search`);
      if (!(contentEl && inputEl)) return;

      const instance = new ux.SearchFilter({
        callback: (event, query, rgx, content) => {
          if (!query && this._loadingSearch) {
            const searchPath = `_${type}SearchValue`;
            const value = this[searchPath] || "";
            rgx = new RegExp(value, "i");
          }
          this.#handleSearchFilter(type, source, method, rgx, contentEl, inputEl);
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

  /** @private */
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

  #handleSearchFilter(type, sourceKey, filterMethodName, rgx, content, input) {
    this.#applyFilter(type, sourceKey, filterMethodName, rgx, content);
    const searchPath = `_${type}SearchValue`;
    if (!input) {
      return;
    }
    this[searchPath] = input.value;
    this._loadingSearch = false;
  }

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
