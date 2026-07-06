import { makeIconClass } from "../../../helpers/icon.mjs";
import { BaseApplicationMixin } from "../../api/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default function BaseSheetMixin(Base) {
  /**
   * @extends {DocumentSheetV2}
   * @property {ApplicationConfiguration & Teriock.Sheet._SheetConfiguration} options
   * @mixin
   */
  class BaseSheet extends BaseApplicationMixin(Base) {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { teriock: { autoIcon: true } };

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
  }
  return BaseSheet;
}
