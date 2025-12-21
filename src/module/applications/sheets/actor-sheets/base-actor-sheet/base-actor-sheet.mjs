import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { conditionSort } from "../../../../helpers/sort.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import * as parts from "./parts/_module.mjs";
import { filterAbilities, filterEquipment } from "./tools/filters.mjs";
import { defaultSheetSettings } from "./tools/settings.mjs";
import { sortAbilities, sortEquipment } from "./tools/sort.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base actor sheet for actorsUuids.
 * Provides comprehensive character management including abilities, equipment, tradecrafts,
 * and various interactive features like character rolling, damage tracking, and condition management.
 * @extends {ActorSheetV2}
 * @mixes CommonSheet
 * @mixes DragDropCommonSheetPart
 * @mixes EquipmentDropSheet
 * @mixes HackStatApplication
 * @mixes HidingActorSheetPart
 * @mixes SearchingActorSheetPart
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockBaseActorSheet extends mix(
  ActorSheetV2,
  HandlebarsApplicationMixin,
  mixins.CommonSheetMixin,
  mixins.EquipmentDropSheetMixin,
  parts.SearchingActorSheetPart,
  parts.HidingActorSheetPart,
  parts.AvatarImageActorSheetPart,
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
      icon: makeIconClass(documentOptions.character.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/actor-templates/playable-template/playable-template.hbs",
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
      // Left-click: forward cycle
      el.addEventListener("click", async () => {
        this.#cycleToggleSwitch(el, true);
        await this.render();
      });
      // Right-click: reverse cycle
      el.addEventListener("contextmenu", async () => {
        this.#cycleToggleSwitch(el, false);
        await this.render();
      });
    });
  }

  /**
   * Add conditions to rendering context.
   * @param {object} context
   */
  async _prepareConditionContext(context) {
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
    context.conditionsMap = {};
    for (const c of this.actor.conditions) {
      context.conditionsMap[toCamelCase(c.name)] = c;
    }
    context.conditionProviders = {};
    context.conditionTooltips = {};
    for (const condition of Object.keys(TERIOCK.index.conditions)) {
      context.conditionProviders[condition] = Array.from(
        this.document.system.conditionInformation[condition].reasons,
      );
      const panelParts = {
        bars: [],
        blocks: [
          {
            text: TERIOCK.data.conditions[condition].description,
            title: "Description",
          },
        ],
        image: TERIOCK.data.conditions[condition].img,
        name: TERIOCK.data.conditions[condition].name,
        associations: [],
        icon: TERIOCK.options.document.condition.icon,
      };
      /** @type {TeriockTokenDocument[]} */
      const tokenDocs = Array.from(
        this.document.system.conditionInformation[condition]?.trackers,
      )
        .map((uuid) => fromUuidSync(uuid))
        .filter((t) => t);
      if (tokenDocs.length > 0) {
        /** @type {Teriock.MessageData.MessageAssociation} */
        const association = {
          title: "Associated Creatures",
          icon: TERIOCK.options.document.creature.icon,
          cards: [],
        };
        for (const tokenDoc of tokenDocs) {
          association.cards.push({
            name: tokenDoc.name,
            uuid: tokenDoc.uuid,
            img: tokenDoc.texture.src,
            id: tokenDoc.id,
            type: "TokenDocument",
            rescale: tokenDoc.rescale,
            makeTooltip: false,
          });
        }
        panelParts.associations.push(association);
      }
      context.conditionTooltips[condition] =
        await TeriockTextEditor.makeTooltip(panelParts);
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.abilities = await this.document.allAbilities();
    context.equipment = context.equipment.filter(
      (e) => !e.sup || e.sup.type !== "equipment",
    );
    this._prepareDisplayContext(context);
    await this._prepareDocumentContext(context);
    await this._prepareConditionContext(context);
    context.enrichedNotes = await this._enrich(this.document.system.notes);
    context.enrichedSpecialRules = await this._enrich(
      this.document.system.primaryAttacker?.system?.specialRules,
    );
    return context;
  }

  /**
   * Add display configuration to rendering context.
   * @param {object} context
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
   */
  async _prepareDocumentContext(context) {
    Object.assign(context, {
      abilities: this._getFilteredAbilities(
        sortAbilities(
          this.actor,
          context.abilities.filter((a) => a.system.revealed || game.user.isGM),
        ),
      ),
      equipment: this._getFilteredEquipment(
        sortEquipment(this.actor, context.equipment),
      ),
    });
  }
}
