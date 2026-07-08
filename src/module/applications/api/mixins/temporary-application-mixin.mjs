/**
 * Mixin for short-lived applications.
 * @param {typeof ApplicationV2} Base
 */
export default function TemporaryApplicationMixin(Base) {
  return (
    /**
     * @extends {ApplicationV2}
     * @mixin
     */
    class TemporaryApplication extends Base {
      /** @inheritDoc */
      _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("keydown", this._onKeyDown.bind(this));
      }

      /**
       * Handle keypresses within the application.
       * @param {KeyboardEvent} event
       */
      _onKeyDown(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      }
    }
  );
}
