import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import HackStatApplicationMixin from "../../../shared/mixins/hack-stat-application-mixin.mjs";
import * as mixins from "../../mixins/_module.mjs";
import defaultSheetSettings from "./helpers/default-sheet-settings.mjs";
import * as parts from "./parts/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

//noinspection JSClosureCompilerSyntax
/**
 * Base actor sheet.
 * @extends {ActorSheetV2}
 * @mixes CommonSheet
 * @mixes DragDropCommonSheetPart
 * @mixes EquipmentDropSheet
 * @mixes FiltersActorSheetPart
 * @mixes HackStatApplication
 * @mixes HidingActorSheetPart
 * @mixes SearchingActorSheetPart
 * @mixes SortingActorSheetPart
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockBaseActorSheet extends mix(
  ActorSheetV2,
  HackStatApplicationMixin,
  HandlebarsApplicationMixin,
  mixins.CommonSheetMixin,
  mixins.EquipmentDropSheetMixin,
  parts.FiltersActorSheetPart,
  parts.HidingActorSheetPart,
  parts.SearchingActorSheetPart,
  parts.SortingActorSheetPart,
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
  _canDropChild(doc) {
    if (doc.type === "ability") {
      return false;
    } else {
      return super._canDropChild(doc);
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
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

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    this._prepareDisplayContext(context);
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
    context.editable = this.isEditable;
    context.actor = this.actor;
    context.settings = this.settings;
  }
}
