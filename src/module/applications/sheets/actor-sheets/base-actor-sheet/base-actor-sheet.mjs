import { documentOptions } from "../../../../constants/options/document-options.mjs";
import {
  conditionSort,
  docSort,
  rankSort,
} from "../../../../helpers/utils.mjs";
import { CommonSheetMixin } from "../../mixins/_module.mjs";
import AvatarImageActorSeetPart from "./parts/avatar-image-actor-seet-part.mjs";
import DocumentCreationActorSheetPart from "./parts/document-creation-actor-sheet-part.mjs";
import DocumentTogglingActorSheetPart from "./parts/document-toggling-actor-sheet-part.mjs";
import HidingCommonSheetPart from "./parts/hiding-common-sheet-part.mjs";
import SearchingActorSheetPart from "./parts/searching-actor-sheet-part.mjs";
import { filterAbilities, filterEquipment } from "./tools/filters.mjs";
import { defaultSheetSettings } from "./tools/settings.mjs";
import { sortAbilities, sortEquipment } from "./tools/sort.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Base actor sheet for actorsUuids.
 * Provides comprehensive character management including abilities, equipment, tradecrafts,
 * and various interactive features like rolling, damage tracking, and condition management.
 * @extends {ActorSheetV2}
 * @mixes HackStatApplication
 * @mixes CommonSheet
 * @mixes HidingCommonSheetPart
 * @mixes SearchingActorSheetPart
 * @mixes DocumentCreationActorSheetPart
 * @mixes DocumentTogglingActorSheetPart
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockBaseActorSheet extends AvatarImageActorSeetPart(
  HidingCommonSheetPart(
    SearchingActorSheetPart(
      DocumentCreationActorSheetPart(
        DocumentTogglingActorSheetPart(CommonSheetMixin(ActorSheetV2)),
      ),
    ),
  ),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "character"],
    position: {
      width: 800,
      height: 600,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.character.icon}`,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/actor-templates/character-template/character-template.hbs",
      scrollable: [".character-sidebar-container", ".character-tab-content"],
    },
  };

  constructor(...args) {
    super(...args);
    this._locked = false;
    /** @type {ActorTab} */
    this._activeTab = "tradecrafts";
    this.settings = defaultSheetSettings();
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

  /**
   * Gets filtered abilities based on current settings.
   * @param {Array} abilities - Array of abilities to filter.
   * @returns {Array} Filtered abilities array.
   */
  _getFilteredAbilities(abilities = []) {
    return filterAbilities(abilities, this.settings.abilityFilters);
  }

  /**
   * Gets filtered equipment based on current settings.
   * @param {Array} equipment - Array of equipment to filter.
   * @returns {Array} Filtered equipment array.
   */
  _getFilteredEquipment(equipment = []) {
    return filterEquipment(equipment, this.settings.equipmentFilters);
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);

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

  /**
   * Add conditions to rendering context.
   * @param {object} context
   * @private
   */
  _prepareConditionContext(context) {
    const conditions = conditionSort(
      Array.from(this.actor.statuses || []).filter((c) =>
        Object.keys(TERIOCK.index.conditions).includes(c),
      ),
    );
    Object.assign(context, {
      conditions: conditions,
      removableConditions: conditions.filter((c) =>
        this.actor.effectKeys.condition.has(c),
      ),
    });
    context.conditionProviders = {};
    for (const condition of Object.keys(TERIOCK.index.conditions)) {
      context.conditionProviders[condition] = Array.from(
        this.document.system.conditionInformation[condition].reasons,
      );
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    this._prepareDisplayContext(context);
    await this._prepareDocumentContext(context);
    this._prepareConditionContext(context);
    context.enrichedNotes = await this._enrich(
      this.document.system.sheet.notes,
    );
    context.enrichedSpecialRules = await this._enrich(
      this.document.system.primaryAttacker?.system?.specialRules,
    );
    return context;
  }

  /**
   * Add display configuration to rendering context.
   * @param {object} context
   * @private
   */
  _prepareDisplayContext(context) {
    context.activeTab = this._activeTab;
    context.editable = this.isEditable;
    context.actor = this.actor;
    context.sidebarOpen = this._sidebarOpen;
    context.settings = this.settings;
  }

  /**
   * Add documents to rendering context.
   * @param {object} context
   * @private
   */
  async _prepareDocumentContext(context) {
    const abilities = await this.actor.allAbilities();
    Object.assign(context, {
      abilities: this._getFilteredAbilities(
        sortAbilities(
          this.actor,
          abilities.filter((a) => a.system.revealed || game.user.isGM),
        ),
      ),
      resources: docSort(
        this.actor.resources.filter((r) => r.system.revealed || game.user.isGM),
        {
          alphabetical: true,
        },
      ),
      equipment: this._getFilteredEquipment(
        sortEquipment(this.actor, this.actor.equipment),
      ),
      powers: docSort(this.actor.powers),
      species: docSort(this.actor.species),
      mounts: docSort(this.actor.mounts),
      fluencies: docSort(
        this.actor.fluencies.filter((f) => f.system.revealed || game.user.isGM),
      ),
      consequences: docSort(this.actor.consequences, {
        alphabetical: true,
      }),
      attunements: docSort(this.actor.attunements, {
        alphabetical: true,
      }),
      bodyParts: docSort(this.actor.bodyParts),
      ranks: rankSort(this.actor.ranks),
    });
  }
}
