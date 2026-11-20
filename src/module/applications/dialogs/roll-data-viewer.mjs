import { makeIconClass } from "../../utils/_module.mjs";
import { DocumentDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { SearchFilter } = foundry.applications.ux;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * A simple application to view a document's roll data.
 */
export default class RollDataViewer extends DocumentDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["roll-data-viewer"],
    position: { height: 600, width: 450 },
    window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.formula, "title"), resizable: true },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { body: { scrollable: [".roll-data-table-container"], template: "teriock/dialogs/roll-data-viewer" } };

  /**
   * The current search query.
   * @type {string}
   */
  #query = "";

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.DIALOGS.RollDataViewer.title";
  }

  /** @inheritDoc */
  async _onRender(context, options = {}) {
    await super._onRender(context, options);
    new SearchFilter({
      contentSelector: ".roll-data-table",
      initial: this.#query,
      inputSelector: ".teriock-block-search",
      callback: (_event, query, rgx, content) => {
        this.#query = query;
        content.querySelectorAll("tbody tr").forEach(row => {
          row.hidden = rgx ? !rgx.test(row.dataset.key) : false;
        });
      },
    }).bind(this.element);
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const entries = Object.entries(this.document.getRollData()).sort(([a], [b]) => a.localeCompare(b));
    return Object.assign(await super._prepareContext(options), {
      query: this.#query,
      rollData: await Promise.all(
        entries.map(async ([key, value]) => ({
          code: await TeriockTextEditor.enrichHTML(`[[code @${key}]]`),
          key,
          value,
        })),
      ),
    });
  }
}
