/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockCommon} document
     */
    class ImageEditingCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          editImage: this._onEditImage,
        },
      };

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
        //noinspection JSUnresolvedReference
        const defaultImg = this.document.constructor.getDefaultArtwork?.(
          this.document.toObject(),
        )?.img;
        const options = {
          current,
          type: "image",
          redirectToRoot: defaultImg ? [defaultImg] : [],
          callback: (path) => this.document.update({ [attr]: path }),
          top: this.position.top + 40,
          left: this.position.left + 10,
        };
        await new foundry.applications.apps.FilePicker(options).browse();
      }
    }
  );
};
