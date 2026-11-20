import { getTypeLabel, makeIconClass } from "../../utils/_module.mjs";
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
  /**
   * Add descriptions to keys the default roll context doesn't know about.
   * @param {string} key
   * @param {boolean} [namespaced]
   * @returns {string}
   */
  static #describe(key, namespaced = false) {
    if (TERIOCK.ROLL_CONTEXT.document[key]) { return TERIOCK.ROLL_CONTEXT.document[key]; }
    for (const [prefix, label] of Object.entries(TERIOCK.CONST.ROLL_DATA_NAMESPACES)) {
      if (!key.startsWith(`${prefix}.`)) { continue; }
      const name = RollDataViewer.#describe(key.slice(prefix.length + 1), true);
      return name && _loc(label, { name });
    }
    const [head, ...tail] = key.split(".");
    let name = "";
    if (head === "parent") {
      const parent = RollDataViewer.#describe(tail.join("."), true);
      name = parent && _loc("TERIOCK.DIALOGS.RollDataViewer.parent", { name: parent });
    } else if (head === "identifier" && tail.length === 2) {
      name = _loc("TERIOCK.DIALOGS.RollDataViewer.identifier");
    } else if (head === "slug" && tail.length === 1) {
      name = _loc("TERIOCK.DIALOGS.RollDataViewer.slug");
    } else if (head === "type" && tail.length === 1) {
      name = getTypeLabel(tail[0]) ?? "";
    }
    return name && !namespaced ? _loc("TERIOCK.DIALOGS.RollDataViewer.actor", { name }) : name;
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["roll-data-viewer"],
    position: { height: 600, width: 600 },
    window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.formula, "title"), resizable: true },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { body: { scrollable: [".roll-data-table-container"], template: "teriock/dialogs/roll-data-viewer" } };

  /**
   * The search filter for roll data keys.
   * @type {SearchFilter}
   */
  #search = new SearchFilter({
    contentSelector: ".roll-data-table",
    inputSelector: ".teriock-block-search",
    callback: (_event, _query, rgx, content) => {
      content.querySelectorAll("tbody tr").forEach(row => {
        row.hidden = !rgx.test(row.dataset.key) && !rgx.test(row.dataset.description);
      });
    },
  });

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.DIALOGS.RollDataViewer.title";
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const entries = Object.entries(this.document.getRollData()).sort(([a], [b]) => a.localeCompare(b));
    return Object.assign(await super._prepareContext(options), {
      rollData: await Promise.all(
        entries.map(async ([key, value]) => ({
          code: await TeriockTextEditor.enrichHTML(`[[code @${key}]]`),
          description: RollDataViewer.#describe(key),
          key,
          value,
        })),
      ),
    });
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    super._replaceHTML(result, content, options);
    this.#search.bind(content);
    this.#search.callback(null, this.#search.query, this.#search.rgx, content.querySelector(".roll-data-table"));
  }

  /** @inheritDoc */
  _tearDown(options) {
    super._tearDown(options);
    this.#search.unbind();
  }
}
