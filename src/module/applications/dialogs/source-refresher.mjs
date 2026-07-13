import { icons } from "../../constants/display/icons.mjs";
import { BaseDataModel } from "../../data/abstract/_module.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
import { DocumentDialog } from "../api/_module.mjs";

const { BooleanField } = foundry.data.fields;

class RefreshOptions extends BaseDataModel {
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

RefreshOptions.preLocalize();

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
    body: { scrollable: [""], template: "teriock/dialogs/source-refresher" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Close this dialog and activate the refresh.
   * @returns {Promise<void>}
   * @this {SourceRefresher}
   */
  static async _onRefresh() {
    const source = await fromUuid(this.state.selected);
    await this.close();
    await this.document.system.refreshFromSource(source, this.state.refreshOptions);
  }

  constructor(...args) {
    super(...args);
    this._registerModelFields(RefreshOptions, "refreshOptions");
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Common.MENU.sourceRefresh";
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
      choiceName: "state.selected",
      documents: documentMap,
      fields: this._prepareModelFields("refreshOptions"),
      hint: _loc(documents.length ? "TERIOCK.DIALOGS.SourceRefresh.hint" : "TERIOCK.DIALOGS.SourceRefresh.noSources"),
      state: this.state,
      tooltip: true,
    });
  }
}
