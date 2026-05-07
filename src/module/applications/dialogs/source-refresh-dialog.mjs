import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { DocumentDialogSheet } from "../sheets/utility-sheets/_module.mjs";

const { BooleanField } = foundry.data.fields;
const { DataModel } = foundry.abstract;

class RefreshOptions extends DataModel {
  static LOCALIZATION_PREFIXES = ["TERIOCK.DIALOGS.SourceRefresh"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      updateDocument: new BooleanField({ initial: true }),
      deleteChildren: new BooleanField({ initial: false }),
      createChildren: new BooleanField({ initial: true }),
      updateChildren: new BooleanField({ initial: true }),
      recursive: new BooleanField({ initial: true }),
    };
  }
}

let localized = false;

export default class SourceRefreshDialog extends DocumentDialogSheet {
  static DEFAULT_OPTIONS = {
    actions: { ok: this._onRefresh },
    classes: ["dynamic-select", "dialog"],
    position: { width: 450 },
    window: {
      contentClasses: ["standard-form"],
      icon: makeIconClass(icons.ui.sourceRefresh, "title"),
      resizable: false,
    },
  };

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

  static PARTS = {
    select: {
      scrollable: [".doc-list-container"],
      template: "teriock/dialogs/select",
    },
    options: { template: "teriock/shared/field-list-part" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    const fields = Object.values(this.refreshOptions.schema.fields);
    switch (partId) {
      case "options":
        context.fields = fields.map((f) => {
          return { field: f };
        });
        break;
    }
    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelectorAll("input[type='checkbox']").forEach((el) => {
      el.addEventListener("change", () => {
        const name = el.getAttribute("name");
        this.refreshOptions[name] = el.checked;
      });
    });
    this.element.querySelectorAll("input[type='radio']").forEach((el) => {
      el.addEventListener("change", () => {
        if (el.checked) this.selected = el.value;
      });
    });
    this.element
      .querySelectorAll(".teriock-block-searchbar")
      .forEach((el) => el.remove());
    this.element.querySelectorAll(".dynamic-select .form-group").forEach(
      /** @param {HTMLElement} el */ (el) => {
        el.style.setProperty("--fade", "0");
      },
    );
  }

  /**
   * Close this dialog and activate the refresh.
   * @returns {Promise<void>}
   * @this {SourceRefreshDialog}
   */
  static async _onRefresh() {
    const source = await fromUuid(this.selected);
    await this.close();
    await this.document.system.refreshFromSource(source, this.refreshOptions);
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const documents = await this.document.system.getRefreshSources();
    const documentMap = Object.fromEntries(
      documents.map((n) => [
        n.document.uuid,
        {
          img: n.document.img,
          name: n.document.name,
          text: n.label,
          uuid: n.document.uuid,
        },
      ]),
    );
    return Object.assign(await super._prepareContext(options), {
      buttons: [
        {
          action: "ok",
          icon: makeIconClass(icons.ui.done, "button"),
          label: "COMMON.Confirm",
          type: "submit",
        },
      ],
      documents: documentMap,
      hint: _loc(
        documents.length
          ? "TERIOCK.DIALOGS.SourceRefresh.hint"
          : "TERIOCK.DIALOGS.SourceRefresh.noSources",
      ),
      tooltip: true,
      tooltipAsync: true,
    });
  }
}
