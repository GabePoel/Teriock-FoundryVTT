import { AbstractTagsElement, TagSetMixin } from "./abstract/_module.mjs";

const { fromUuidSync } = foundry.utils;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * @typedef LocalDocumentInputConfig
 * @property {string[]} [uuids] - UUIDs of the documents which can be chosen.
 */

/**
 * A picker for a single embedded document referenced by ID. Documents are chosen with a {@link DocumentSelector}.
 */
export default class HTMLLocalDocumentElement extends TagSetMixin(AbstractTagsElement) {
  /** @inheritDoc */
  static icons = { ...super.icons, add: "fa-solid fa-file-import" };

  /** @inheritDoc */
  static labels = {
    ...super.labels,
    add: "TERIOCK.ELEMENTS.LOCAL_DOCUMENT.select",
    remove: "ELEMENTS.DOCUMENT_TAGS.Remove",
  };

  /** @inheritDoc */
  static tagName = "local-document";

  /**
   * Create an HTMLLocalDocumentElement using provided configuration data.
   * @param {FormInputConfig<string> & LocalDocumentInputConfig} config
   * @returns {HTMLLocalDocumentElement}
   */
  static create(config) {
    config.placeholder ||= _loc("TERIOCK.ELEMENTS.LOCAL_DOCUMENT.placeholder");
    const el = super.create(Object.assign(config, { single: true }));
    el.uuids = config.uuids;
    return el;
  }

  /**
   * UUIDs of the documents which can be chosen.
   * @returns {string[]}
   */
  get uuids() {
    return this.getAttribute("uuids")?.split(",").filter(Boolean) ?? [];
  }

  /** @param {string[]} value */
  set uuids(value) {
    this.setAttribute("uuids", value?.join(",") ?? "");
  }

  /** @inheritDoc */
  async _onClickButton() {
    const documents = this.uuids.map(uuid => fromUuidSync(uuid)).filter(Boolean);
    const selected = await teriock.applications.dialogs.DocumentSelector.selectSingle(documents, {
      auto: false,
      checked: documents.find(d => d.id === this._getValue())?.uuid,
      nullable: true,
      openable: true,
    });
    if (selected === null) { this.value = null; }
    else if (selected) { this._tryAdd(selected.id); }
  }

  /** @inheritDoc */
  _onDropData(data) {
    this._tryAdd(foundry.utils.parseUuid(data.uuid ?? "")?.id ?? "");
  }

  /** @inheritDoc */
  _resolveTag(id) {
    id = id.trim();
    const uuid = this.uuids.find(u => u.endsWith(`.${id}`));
    const doc = uuid ? fromUuidSync(uuid) : null;
    if (!doc) { throw new Error(`"${id}" is not an available document.`); }
    return [id, doc.name];
  }
}
