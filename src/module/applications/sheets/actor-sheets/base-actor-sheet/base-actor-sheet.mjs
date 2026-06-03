import { mixClasses } from "../../../../helpers/construction.mjs";
import { changeSizeDialog } from "../../../dialogs/_module.mjs";
import HackStatApplicationMixin from "../../../shared/mixins/hack-stat-application-mixin.mjs";
import * as mixins from "../../mixins/_module.mjs";
import defaultSheetSettings from "./helpers/default-sheet-settings.mjs";
import * as parts from "./parts/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

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
 * @property {Teriock.Sheet.BaseActorSheetSettings} settings
 */
export default class BaseActorSheet
  extends mixClasses(
    ActorSheetV2,
    HackStatApplicationMixin,
    HandlebarsApplicationMixin,
    mixins.CommonSheetMixin,
    mixins.EquipmentDropSheetMixin,
    parts.FiltersActorSheetPart,
    parts.HidingActorSheetPart,
    parts.SearchingActorSheetPart,
    parts.SortingActorSheetPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["unpadded", "character"], form: { submitOnChange: true } };

  constructor(...args) {
    super(...args);
    this._locked = false;
    this._activeTab = "tradecrafts";
    this.settings = defaultSheetSettings();
  }

  /**
   * Cycle the value of a three-way switch either forwards or backwards.
   * @param {HTMLButtonElement} toggleSwitch
   * @param {number} change
   */
  #cycleToggleSwitch(toggleSwitch, change = 1) {
    const name = toggleSwitch.getAttribute("data-name");
    if (!name) { return; }
    const val = foundry.utils.getProperty(this, name);
    foundry.utils.setProperty(this, name, ((val + 1 + change) % 3) - 1);
  }

  /** @type {string} */
  _activeTab;

  /** @inheritDoc */
  async _onDropChild(event, dropData) {
    const out = await super._onDropChild(event, dropData);
    if (
      out?.type === "species" && out.system.size.enabled
      && out.system.size.value !== this.document.system._source.size.number
    ) {
      changeSizeDialog(this.actor, out);
    }
    return out;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    /** @type {NodeListOf<HTMLButtonElement>} */
    const toggleSwitches = this.element.querySelectorAll("button[data-action=\"toggleSwitch\"]");
    toggleSwitches.forEach(el => {
      // Left-click: forward cycle
      el.addEventListener("click", async () => {
        this.#cycleToggleSwitch(el, 1);
        await this.render();
      });
      // Right-click: reverse cycle
      el.addEventListener("contextmenu", async () => {
        this.#cycleToggleSwitch(el, 2);
        await this.render();
      });
      // Support right-click on associated labels
      if (!el.id) { return; }
      const label = this.element.querySelector(`label[for="${el.id}"]`);
      if (!label) { return; }
      label.addEventListener("contextmenu", async event => {
        event.preventDefault();
        this.#cycleToggleSwitch(el, 2);
        await this.render();
      });
    });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    this._prepareDisplayContext(context);
    context.enrichedNotes = await this._enrich(this.document.system.notes);
    context.enrichedSpecialRules = await this._enrich(this.document.system.wielding.attacker?.system?.specialRules);
    context.consumableAbilities = this.document.abilities.filter(a => a.system.consumable);
    context.consumableProperties = this.document.properties.filter(a => a.system.consumable);
    return context;
  }

  /**
   * Add display configuration to rendering context.
   * @param {object} context
   */
  _prepareDisplayContext(context) {
    context.actor = this.actor;
    context.editable = this.isEditable;
    context.settings = this.settings;
  }
}
