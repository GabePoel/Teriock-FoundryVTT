/**
 * Mixin for short-lived applications.
 * @param {typeof ApplicationV2 & typeof BaseApplication} Base
 */
export default function TemporaryApplicationMixin(Base) {
  return (
    /**
     * @extends {ApplicationV2 & BaseApplication}
     * @mixin
     */
    class TemporaryApplication extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = { doubles: { openDocument: this._onDoubleClickOpenDocument } };

      /**
       * Open a document sheet when a row is double-clicked.
       * @param {MouseEvent} _event
       * @param {HTMLElement} target
       * @this {SourceRefresher}
       */
      static async _onDoubleClickOpenDocument(_event, target) {
        const row = /** @type {HTMLElement|null} */ (target.closest("[data-uuid]") ?? target);
        if (!row?.dataset.uuid) { return; }
        const doc = /** @type {AnyChildDocument} */ await fromUuid(row.dataset.uuid);
        await doc?.sheet?.render(true);
      }

      /** @inheritDoc */
      _onPressKey(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      }
    }
  );
}
