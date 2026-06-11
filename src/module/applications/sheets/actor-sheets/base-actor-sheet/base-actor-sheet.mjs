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
    /** @type {NodeListOf<HTMLTernaryElement>} */
    const ternaryInputs = this.element.querySelectorAll("ternary-input[name]");
    ternaryInputs.forEach(el => {
      el.addEventListener("change", async () => {
        foundry.utils.setProperty(this, el.name, el.value);
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
