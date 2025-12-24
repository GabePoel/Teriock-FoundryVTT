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
    class StatDiceCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          setStatDice: this._onSetStatDice,
        },
      };

      /**
       * Modify a specified stat pool.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onSetStatDice(_event, target) {
        if (!this.isEditable) {
          return;
        }
        const stat = target.dataset.stat;
        const pool =
          /** @type {StatPoolModel} */ this.document.system.statDice[stat];
        await pool.setStatDice();
      }
    }
  );
};
