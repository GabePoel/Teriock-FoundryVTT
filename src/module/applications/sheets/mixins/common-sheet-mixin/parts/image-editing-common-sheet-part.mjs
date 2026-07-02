/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function ImageEditingCommonSheetPart(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class ImageEditingCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { editImage: this._onEditImage } };

      /**
       * Opens image picker for editing document images.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onEditImage(event, target) {
        event.stopPropagation();
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
  );
}
