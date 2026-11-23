import { mixClasses } from "../../../../utils/_module.mjs";
import { BaseDocumentSheetMixin } from "../../../api/_module.mjs";
import { HackStatApplicationMixin } from "../../../mixins/_module.mjs";
import { CommonSheetMixin, InventoryManagementSheetMixin } from "../../mixins/_module.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Base actor sheet.
 * @extends {ActorSheetV2}
 * @mixes HandlebarsApplication
 * @mixes HackStatApplication
 * @mixes BaseDocumentSheet
 * @mixes CommonSheet
 * @mixes InventoryManagementSheet
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class BaseActorSheet
  extends mixClasses(
    ActorSheetV2,
    HandlebarsApplicationMixin,
    HackStatApplicationMixin,
    BaseDocumentSheetMixin,
    CommonSheetMixin,
    InventoryManagementSheetMixin,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._ActorSheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["unpadded", "actor"],
    form: { submitOnChange: true },
    teriock: { startLocked: false, tabHeaders: true },
    window: { contentClasses: ["actor-window"] },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      enrichedNotes: await this._enrich(this.document.system.notes)
        ?? `<p>${_loc("TERIOCK.SHEETS.Actor.TABS.Details.notes.placeholder")}</p>`,
      enrichedStyleDescription: await this._enrich(this.document.system.wielding.attacker?.system?.styleDescription),
      tabHeaders: foundry.utils.getProperty(this, "options.teriock.tabHeaders"),
    });
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.tab = context.tabs?.[partId];
    return context;
  }
}
