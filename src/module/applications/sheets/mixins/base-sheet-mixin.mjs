import { BaseApplicationMixin } from "../../shared/mixins/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default function BaseSheetMixin(Base) {
  /**
   * @extends {DocumentSheetV2}
   */
  class BaseSheet extends BaseApplicationMixin(Base) {
    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      Object.assign(context, {
        editable: this.isEditable,
        fields: this.document.schema.fields,
        flags: this.document.flags,
        id: this.document.id,
        img: this.document?.img,
        isGM: game.user.isGM,
        limited: this.document.limited,
        name: this.document.name,
        owner: this.document.isOwner,
        source: this.document._source,
        system: this.document.system,
        systemFields: this.document.system?.schema.fields,
        uuid: this.document.uuid,
      });
      return context;
    }
  }
  return BaseSheet;
}
