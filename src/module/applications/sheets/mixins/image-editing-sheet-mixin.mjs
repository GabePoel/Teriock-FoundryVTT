const { ImagePopout } = foundry.applications.apps;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {Constructor<TeriockDocumentSheet>} T
 * @param {T} Base
 */
export default function ImageEditingSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
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
          const defaultImg = this.document.constructor.getDefaultArtwork?.(this.document.toObject())?.img;
          const options = {
            current,
            left: this.position.left + 10,
            redirectToRoot: defaultImg ? [defaultImg] : [],
            top: this.position.top + 40,
            type: "image",
            callback: path => this.document.update({ [attr]: path }),
          };
          await new foundry.applications.apps.FilePicker(options).browse();
        }
      }
    }
  );
}
