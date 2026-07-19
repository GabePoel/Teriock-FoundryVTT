import { mixClasses } from "../../../../helpers/construction.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { BaseDocumentSheetMixin } from "../../../api/_module.mjs";
import { HackStatApplicationMixin } from "../../../shared/_module.mjs";
import { TeriockDragDrop } from "../../../ux/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Base actor sheet.
 * @extends {ActorSheetV2}
 * @mixes BaseDocumentSheet
 * @mixes CommonSheet
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
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { classes: ["unpadded", "actor"], form: { submitOnChange: true } };

  constructor(...args) {
    super(...args);
    this._locked = false;
  }

  /** @inheritDoc */
  _dropEffect(event) {
    const dropEffect = super._dropEffect(event);
    if (dropEffect === "none") { return dropEffect; }
    const document = TeriockDragDrop.payload?.document;
    if (
      document?.type === "equipment" && document.actor && document.isOwner
      && (document.actor === this.document || !document.inCompendium)
    ) {
      return "move";
    }
    return dropEffect;
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      currencyImages: Object.fromEntries(
        [...Object.keys(TERIOCK.config.currency), "debt"].map(id => [id, getImage("currency", id)]),
      ),
      enrichedNotes: await this._enrich(this.document.system.notes),
      enrichedSpecialRules: await this._enrich(this.document.system.wielding.attacker?.system?.specialRules),
    });
  }
}
