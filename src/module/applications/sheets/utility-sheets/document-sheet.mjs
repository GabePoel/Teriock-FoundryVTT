const { DocumentSheetV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

//noinspection JSValidateJSDoc
/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 */
export default class TeriockDocumentSheet extends HandlebarsApplicationMixin(
  DocumentSheetV2,
) {
  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    return Object.assign(context, {
      TERIOCK,
      img: this.document.img,
      name: this.document.name,
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
      uuid: this.document.uuid,
    });
  }
}
