import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseApplicationMixin from "./base-application-mixin.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default function BaseDocumentSheetMixin(Base) {
  /**
   * @extends {DocumentSheetV2}
   * @property {ApplicationConfiguration & Teriock.Sheet._SheetConfiguration} options
   * @mixin
   */
  class BaseDocumentSheet extends BaseApplicationMixin(Base) {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      classes: ["teriock-sheet"],
      teriock: { autoIcon: true, maximizeOnDragEnter: true, minimizeOnDragStart: true },
    };

    /** @inheritDoc */
    get isEditable() {
      if (this.document.isStatus) { return false; }
      return super.isEditable;
    }

    /** @inheritDoc */
    async _onFirstRender(context, options) {
      await super._onFirstRender(context, options);
      if (!this.options.teriock?.autoIcon || !this.window.header) { return; }
      const typeIcons = CONFIG[this.document.documentName]?.typeIcons;
      const typeIcon = typeIcons ? typeIcons[this.document.type] : null;
      const sidebarIcon = CONFIG[this.document.documentName]?.sidebarIcon;
      const icon = typeIcon ?? sidebarIcon ?? TERIOCK.config.document.document.icon;
      this.window.icon.className = makeIconClass(icon, "title");
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), {
        editable: this.isEditable,
        fields: this.document?.schema.fields,
        flags: this.document.flags,
        highlightModified: game.settings.get("teriock", "highlightModifiedValues"),
        id: this.document.id,
        img: this.document?.img,
        imgPath: "img",
        isGM: game.user.isGM,
        limited: this.document?.limited,
        name: this.document.name,
        owner: this.document?.isOwner,
        source: this.document?._source,
        system: this.document.system,
        systemFields: this.document.system?.schema.fields,
        type: this.document.type,
        uuid: this.document.uuid,
      });
    }

    /** @inheritDoc */
    _replaceHTML(result, content, options) {
      super._replaceHTML(result, content, options);
      // Re-apply again because prose-mirrors rebuild themselves after the first re-apply.
      this._reapplyCollapsibleSates();
    }

    /** @inheritDoc */
    _toggleDisabled(disabled) {
      super._toggleDisabled(disabled);
      if (!disabled) { return; }
      // If a prose-mirror element is disabled, then we can't toggle whether any enriched panels are collapsed. This is
      // an ugly hack that enables the element but disables the editor toggle button.
      // TODO: Remove this if this ever changes.
      for (const editor of this.element?.querySelectorAll("prose-mirror") ?? []) {
        editor.disabled = false;
        const toggle = editor.querySelector(":scope > button.toggle");
        if (toggle) { toggle.disabled = true; }
      }
    }
  }
  return BaseDocumentSheet;
}
