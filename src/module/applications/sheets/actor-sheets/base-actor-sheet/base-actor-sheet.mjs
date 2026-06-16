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
 * @mixes HackStatApplication
 * @mixes HidingActorSheetPart
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
    parts.HidingActorSheetPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["unpadded", "character"], form: { submitOnChange: true } };

  /**
   * Per-document-type block display defaults applied to the preview models.
   * @type {Record<string, PreviewDisplay>}
   */
  static PREVIEW_DISPLAY = {
    ability: { gapless: true, size: "small" },
    consequence: { gapless: true, size: "small" },
    equipment: { gapless: true, size: "small" },
  };

  constructor(...args) {
    super(...args);
    this._locked = false;
    this._activeTab = "tradecrafts";
    this.settings = defaultSheetSettings();
    for (const [type, display] of Object.entries(BaseActorSheet.PREVIEW_DISPLAY)) {
      this.previewMenus[type]?.updateSource({ display });
    }
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
    const ternaryInputs = this.element.querySelectorAll("ternary-input[name]:not([name^=\"previewMenus.\"])");
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
    this._preparePreviewGroups(context);
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

  /**
   * Build the document groups shown under each tab's preview, keyed by document type. Each group is
   * `{ docs, empty, optional? }`; the primary group of each tab is filtered and sorted through its preview
   * model, while distinct secondary categories keep their existing order.
   * @param {object} context
   */
  _preparePreviewGroups(context) {
    const d = TERIOCK.config.document;
    const p = this.previewMenus;
    const isGM = game.user.isGM;
    const visible = a => !a.isReference && (a.system.revealed || isGM);
    Object.assign(context.previewGroups, {
      ability: [{
        docs: p.ability.previewDocuments((this.document.abilities ?? []).filter(visible)),
        empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.nonBasic"),
      }, {
        docs: p.ability.previewDocuments(game.teriock.basicAbilities.filter(visible)),
        empty: _loc("TERIOCK.SHEETS.Actor.TABS.Abilities.basic"),
      }],
      consequence: [{ docs: p.consequence.previewDocuments(context.consequences ?? []), empty: d.consequence.plural }, {
        docs: context.attunements ?? [],
        empty: d.attunement.plural,
      }, { docs: context.miscEffects ?? [], empty: d.effect.plural, optional: true }],
      equipment: [
        {
          docs: p.equipment.previewDocuments(
            (context.equipment ?? []).filter(e => !e.sup || e.sup.type !== "equipment"),
          ),
          empty: d.equipment.plural,
        },
        { docs: p.equipment.previewDocuments(context.bodyParts ?? []), empty: d.body.plural },
        { docs: p.equipment.previewDocuments(context.mounts ?? []), empty: d.mount.plural },
      ],
      fluency: [{ docs: p.fluency.previewDocuments(context.fluencies ?? []), empty: d.fluency.plural }],
      power: [{ docs: context.species ?? [], empty: d.species.plural }, {
        docs: p.power.previewDocuments(context.powers ?? []),
        empty: d.power.plural,
      }],
      rank: [{ docs: p.rank.previewDocuments(context.ranks ?? []), empty: d.rank.plural }, {
        docs: context.archetypes ?? [],
        empty: d.archetype.plural,
        optional: true,
      }],
      resource: [{ docs: p.resource.previewDocuments(context.resources ?? []), empty: d.resource.plural }, {
        docs: context.consumableAbilities ?? [],
        empty: _loc("TERIOCK.SHEETS.Actor.TABS.Resources.consumable", { value: d.ability.plural }),
      }, {
        docs: context.consumableProperties ?? [],
        empty: _loc("TERIOCK.SHEETS.Actor.TABS.Resources.consumable", { value: d.property.plural }),
      }],
    });
  }
}
