import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { BaseDocumentSheetMixin, TeriockDialog } from "../../../api/_module.mjs";
import { HackStatApplicationMixin } from "../../../shared/_module.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base actor sheet.
 * @extends {ActorSheetV2}
 * @mixes BaseDocumentSheet
 * @mixes CommonSheet
 * @mixes EquipmentDropSheet
 * @mixes HackStatApplication
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class BaseActorSheet
  extends mixClasses(
    ActorSheetV2,
    HackStatApplicationMixin,
    HandlebarsApplicationMixin,
    BaseDocumentSheetMixin,
    mixins.CommonSheetMixin,
    mixins.EquipmentDropSheetMixin,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["unpadded", "actor"], form: { submitOnChange: true } };

  constructor(...args) {
    super(...args);
    this._locked = false;
  }

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
    context.enrichedNotes = await this._enrich(this.document.system.notes);
    context.enrichedSpecialRules = await this._enrich(this.document.system.wielding.attacker?.system?.specialRules);
    context.currencyImages = Object.fromEntries(
      [...Object.keys(TERIOCK.config.currency), "debt"].map(id => [id, getImage("currency", id)]),
    );
    return context;
  }
}
