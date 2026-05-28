/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class FrameCommonSheetPart extends Base {
      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium && this.window.header) {
          this.window.header.style.backgroundColor = "var(--compendium-sheet-header-background-color)";
        }
        return frame;
      }
    }
  );
};
