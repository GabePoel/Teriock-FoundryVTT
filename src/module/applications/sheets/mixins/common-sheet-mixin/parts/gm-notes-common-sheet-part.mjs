/**
 * @param {typeof DocumentSheetV2} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @mixin
     * @property {TeriockCommon} document
     */
    class GmNotesCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          gmNotesOpen: this._onGmNotesOpen,
        },
      };

      /**
       * Opens the GM notes page or makes one if one doesn't already exist.
       * @returns {Promise<void>}
       */
      static async _onGmNotesOpen() {
        await this.document.system.gmNotesOpen();
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (game.user.isGM) {
          const notesButton = document.createElement("button");
          notesButton.classList.add(
            ...["header-control", "icon", "fa-solid", "fa-notes"],
          );
          notesButton.setAttribute("data-action", "gmNotesOpen");
          notesButton.setAttribute("data-tooltip", "Open GM Notes");
          this.window.controls.before(notesButton);
        }
        return frame;
      }
    }
  );
};
