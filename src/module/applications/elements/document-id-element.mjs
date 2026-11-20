import { AbstractTagsElement, TagSetMixin } from "./abstract/_module.mjs";

const { fromUuidSync } = foundry.utils;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * @typedef DocumentIdInputConfig
 * @property {string[]} [uuids] - UUIDs of the documents which can be chosen.
 */

/**
 * A picker for documents referenced by ID. Documents are chosen with a {@link DocumentSelector}.
 */
export default class HTMLDocumentIdElement extends TagSetMixin(AbstractTagsElement) {
  /** @inheritDoc */
  static icons = { ...super.icons, add: "fa-solid fa-file-import" };

  /** @inheritDoc */
  static labels = {
    ...super.labels,
    add: "TERIOCK.ELEMENTS.DOCUMENT_ID.select",
    remove: "ELEMENTS.DOCUMENT_TAGS.Remove",
  };

  /** @inheritDoc */
  static tagName = "document-id";

  /**
   * Create an HTMLDocumentIdElement using provided configuration data.
   * @param {FormInputConfig<string> & DocumentIdInputConfig} config
   * @returns {HTMLDocumentIdElement}
   */
  static create(config) {
    config.placeholder ||= _loc("TERIOCK.ELEMENTS.DOCUMENT_ID.placeholder");
    const el = super.create(config);
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
    const { DocumentSelector } = teriock.applications.dialogs;
    const documents = this.uuids.map(uuid => fromUuidSync(uuid)).filter(Boolean);
    const ids = [this._getValue() ?? []].flat();
    const checked = documents.filter(d => ids.includes(d.id)).map(d => d.uuid);
    if (!this.single) {
      const selected = await DocumentSelector.selectMulti(documents, { checked, openable: true });
      if (selected) { this.value = selected.map(d => d.id); }
      return;
    }
    const selected = await DocumentSelector.selectSingle(documents, {
      auto: false,
      checked: checked[0],
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
