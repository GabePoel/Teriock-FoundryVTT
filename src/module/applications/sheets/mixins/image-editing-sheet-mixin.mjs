const { ImagePopout } = foundry.applications.apps;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ImageEditingSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockActiveEffect|TeriockActor|TeriockItem} document
   */
  class ImageEditingSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { editImage: { buttons: [0, 2], handler: this._onEditImage } } };

    /**
     * Opens image picker for editing document images.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this {ImageEditingSheet}
     */
    static async _onEditImage(event, target) {
      event.stopPropagation();
      if (event.button === 2 || !this.isEditable) {
        const src = target.src || this.document?.img;
        const title = target.title || target.alt || this.document.fullName || this.document.name;
        const uuid = this.document.uuid;
        await new ImagePopout({ src, uuid, window: { title } }).render({ force: true });
      } else {
        const attr = target.dataset.edit;
        const current = foundry.utils.getProperty(this.document, attr);
        // Split so that if the update affects a document other than the one on this sheet it can still be updated.
        const [head, ...rest] = attr.split(".");
        const [doc, path] = this.document[head] instanceof foundry.abstract.Document
          ? [this.document[head], rest.join(".")]
          : [this.document, attr];
        const defaultImg = foundry.utils.getProperty(doc.constructor.getDefaultArtwork?.(doc._source) ?? {}, path);
        const options = {
          current,
          left: this.position.left + 10,
          redirectToRoot: defaultImg ? [defaultImg] : [],
          top: this.position.top + 40,
          type: "image",
          callback: async src => {
            await doc.update({ [path]: src });
            if (doc !== this.document) { await this.render(); }
          },
        };
        await new foundry.applications.apps.FilePicker(options).browse();
      }
    }
  }

  return ImageEditingSheet;
}
