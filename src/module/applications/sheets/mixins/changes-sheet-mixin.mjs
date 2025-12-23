export default function ChangesSheetMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {CommonSheet}
     * @mixes CommonSheet
     * @mixin
     */
    class ChangesSheet extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          addChange: this._onAddChange,
          deleteChange: this._onDeleteChange,
        },
      };

      /**
       * Adds a new change at any specified path.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when change is added.
       * @static
       */
      static async _onAddChange(_event, target) {
        const path = target.dataset.path;
        if (!path) {
          console.error("No path specified for addChange action");
          return;
        }
        const currentChanges =
          foundry.utils.getProperty(this.document, path) || [];
        const newChange = {
          key: "",
          mode: 0,
          value: "",
          priority: 0,
        };
        currentChanges.push(newChange);
        await this.document.update({ [path]: currentChanges });
      }

      /**
       * Deletes a change at any specified path.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when change is deleted.
       * @static
       */
      static async _onDeleteChange(_event, target) {
        const index = parseInt(target.dataset.index, 10);
        const path = target.dataset.path;
        if (!path) {
          console.error("No path specified for deleteChange action");
          return;
        }
        const changes = foundry.utils.getProperty(this.document, path);
        if (!changes || !Array.isArray(changes)) {
          console.error(`No changes array found at path: ${path}`);
          return;
        }
        if (index >= 0 && index < changes.length) {
          changes.splice(index, 1);
          await this.document.update({ [path]: changes });
        }
      }
    }
  );
}
