import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { dotJoin } from "../../../helpers/string.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Something an actor derives during preparation that is displayed as though it were a document, but is not one.
 * @extends {BaseDataModel}
 * @property {Teriock.System.ImageString} img
 * @property {Set<string>} providers
 * @property {Set<UUID<TeriockDocument>>} sources
 */
export default class BaseVirtualModel extends BaseDataModel {
  /**
   * The name this stands in for, used to build {@link uuid}.
   * @returns {string}
   */
  static get VIRTUAL_NAME() {
    return "Virtual";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
      providers: new fields.SetField(new fields.StringField()),
      sources: new fields.SetField(new fields.DocumentUUIDField()),
    });
  }

  /**
   * The documents that provide this.
   * @returns {Promise<TeriockDocument[]>}
   */
  async #getSourceDocuments() {
    const docs = await Promise.all(Array.from(this.sources).map(uuid => fromUuid(uuid)));
    return docs.filter(doc => doc?.isViewer);
  }

  /**
   * Open whatever gives this to the actor.
   * @returns {Promise<void>}
   */
  async #openSource() {
    const sources = await this.#getSourceDocuments();
    if (!sources.length) { return; }
    const source = await DocumentSelector.selectSingle(sources, {
      hint: _loc("TERIOCK.DIALOGS.Select.Source.hint"),
      openable: true,
      title: "TERIOCK.DIALOGS.Select.Source.title",
    });
    await source?.sheet?.render(true);
  }

  /**
   * Icons denoting something about this.
   * @returns {Teriock.EmbedData.EmbedIcon[]}
   */
  get _embedIcons() {
    return [];
  }

  /**
   * The block this renders as.
   * @returns {Teriock.EmbedData.EmbedParts}
   */
  get embedParts() {
    return {
      draggable: false,
      icons: this._embedIcons,
      identifier: this.identifier,
      img: this.img,
      openable: false,
      subtitle: this.subtitle,
      text: this.text,
      title: this.name,
      uuid: this.uuid,
    };
  }

  /**
   * A key unique among the virtual models of this kind on a single actor.
   * @returns {string}
   */
  get id() {
    return "";
  }

  /**
   * The document this stands for. Clicking the block opens whatever this refers to.
   * @returns {TypedIdentifier | string}
   */
  get identifier() {
    return "";
  }

  /**
   * Used for searching and sorting.
   * @returns {string}
   */
  get name() {
    return "";
  }

  /**
   * @returns {string}
   */
  get subtitle() {
    return "";
  }

  /**
   * The things that give this to the actor.
   * @returns {string}
   */
  get text() {
    return dotJoin(Array.from(this.providers));
  }

  /**
   * A stable "uuid" that is deliberately not resolvable.
   * @returns {string}
   */
  get uuid() {
    return `${this.constructor.VIRTUAL_NAME}.${this.id}`;
  }

  /**
   * Kinda an embed card `getCardContextMenuEntries` call.
   * @returns {ContextMenuEntry[]}
   */
  getCardContextMenuEntries() {
    return [{
      group: "open",
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
      onClick: async () => await this.#openSource(),
      visible: () => this.sources.size > 0,
    }];
  }

  /**
   * Kinda an embed card `onEmbed` call.
   * @param {HTMLElement} element
   */
  onEmbed(element) {
    const menuEntries = this.getCardContextMenuEntries();
    if (!menuEntries.length) { return; }
    element.addEventListener("contextmenu", event => {
      const action = /** @type {HTMLElement} */ (event.target).closest("[data-action]")?.dataset.action;
      if (action && (action === this.embedParts.action)) { event.stopImmediatePropagation(); }
    });
    new TeriockContextMenu(element, ".teriock-block", menuEntries, {
      eventName: "contextmenu",
      fixed: true,
      jQuery: false,
    });
  }
}
