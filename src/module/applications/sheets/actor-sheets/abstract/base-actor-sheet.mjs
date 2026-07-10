import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import { TeriockDialog } from "../../../api/_module.mjs";
import { HackStatApplicationMixin } from "../../../shared/_module.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base actor sheet.
 * @extends {ActorSheetV2}
 * @mixes CommonSheet
 * @mixes DragDropCommonSheetPart
 * @mixes EquipmentDropSheet
 * @mixes HackStatApplication
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
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["unpadded", "character"], form: { submitOnChange: true } };

  /**
   * Per-document-type block display defaults applied to the preview models.
   * @type {Record<string, Teriock.Models.PreviewDisplay>}
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
    this.settings = { avatarImagePath: "img", conditionExpansions: {} };
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
      if (this.actor.system.size.number !== out.system.size.value) {
        const proceed = await TeriockDialog.confirm({
          content: await TeriockTextEditor.enrichHTML(
            _loc("TERIOCK.DIALOGS.ChangeSize.content", {
              actor: `@UUID[${this.actor.uuid}]`,
              actorSize: this.actor.system.size.number,
              species: `@UUID[${out.uuid}]`,
              speciesSize: out.system.size.value,
            }),
          ),
          modal: true,
          position: { width: 400 },
          window: {
            icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
            title: _loc("TERIOCK.DIALOGS.ChangeSize.title"),
          },
        });
        if (proceed) { await this.actor.update({ "system.size.number": out.system.size.value }); }
      }
    }
    return out;
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
   * `{ docs, empty, optional? }`. The primary group of each tab is filtered and sorted through its preview
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
        docs: p.rank.previewDocuments(context.archetypes ?? []),
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
