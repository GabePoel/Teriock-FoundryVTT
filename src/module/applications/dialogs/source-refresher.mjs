import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { DocumentDialog } from "../api/_module.mjs";

const { BooleanField } = foundry.data.fields;
const { DataModel } = foundry.abstract;

class RefreshOptions extends DataModel {
  static LOCALIZATION_PREFIXES = ["TERIOCK.DIALOGS.SourceRefresh"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      createChildren: new BooleanField({ initial: true }),
      deleteChildren: new BooleanField({ initial: false }),
      fullOverride: new BooleanField({ initial: false }),
      recursive: new BooleanField({ initial: true }),
      updateChildren: new BooleanField({ initial: true }),
      updateDocument: new BooleanField({ initial: true }),
    };
  }
}

let localized = false;

/**
 * @property {AnyCommonDocument & { system: RefreshSystem }} document
 */
export default class SourceRefresher extends DocumentDialog {
  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onRefresh },
    classes: ["dynamic-select", "dialog"],
    position: { width: 450 },
    window: { contentClasses: ["standard-form"], icon: makeIconClass(icons.ui.compendium, "title"), resizable: false },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    select: { scrollable: [".doc-list-container"], template: "teriock/dialogs/document-selector" },
    options: { template: "teriock/shared/field-list-part" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Close this dialog and activate the refresh.
   * @returns {Promise<void>}
   * @this {SourceRefresher}
   */
  static async _onRefresh() {
    const source = await fromUuid(this.selected);
    await this.close();
    await this.document.system.refreshFromSource(source, this.refreshOptions);
  }

  constructor(...args) {
    super(...args);
    if (!localized) {
      foundry.helpers.Localization.localizeDataModel(RefreshOptions);
      localized = true;
    }
    this.refreshOptions = new RefreshOptions();
    this.selected = null;
  }

  /** @type {RefreshOptions} */
  refreshOptions;

  /** @type {UUID<AnyCommonDocument>|null} */
  selected;

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Common.MENU.sourceRefresh";
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // Remove search since this shouldn't ever have enough documents to warrant it
    this.element.querySelectorAll(".teriock-block-searchbar").forEach(el => el.remove());
    this.element.querySelectorAll(".dynamic-select .form-group").forEach(/** @param {HTMLElement} el */ el => {
      el.style.setProperty("--fade", "0");
    });
    // Listen for updates from the available refresh source documents
    this.element.querySelectorAll("input[type='radio']").forEach(el => {
      el.addEventListener("change", () => {
        if (el?.checked) { this.selected = el.value; }
      });
    });
    // Listen for refresh option updates
    this.element.querySelectorAll("input[type='checkbox']").forEach(el => {
      el.addEventListener("change", () => {
        const name = el.getAttribute("name");
        this.refreshOptions[name] = el?.checked;
      });
    });
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const documents = await this.document.system.getRefreshSources();
    const documentMap = Object.fromEntries(
      documents.map(
        n => [n.document.uuid, { img: n.document.img, name: n.document.name, text: n.label, uuid: n.document.uuid }]
      ),
    );
    return Object.assign(await super._prepareContext(options), {
      buttons: [{
        action: "ok",
        icon: makeIconClass(icons.ui.done, "button"),
        label: "COMMON.Confirm",
        type: "submit",
      }],
      documents: documentMap,
      hint: _loc(documents.length ? "TERIOCK.DIALOGS.SourceRefresh.hint" : "TERIOCK.DIALOGS.SourceRefresh.noSources"),
      tooltip: true,
    });
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "options") {
      context.fields = Object.values(this.refreshOptions.schema.fields).map(f => {
        return { field: f };
      });
    }
    return context;
  }
}
