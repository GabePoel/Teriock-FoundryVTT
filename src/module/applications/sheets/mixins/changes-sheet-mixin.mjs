export default function ChangesSheetMixin(Base) {
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
       * @returns {Promise<void>}
       */
      static async _onAddChange(_event, target) {
        const path = target.dataset.path;
        let valuePath = target.dataset.valuePath;
        if (!(typeof valuePath === "string")) valuePath = path;
        if (!path) {
          console.error(game.i18n.localize("TERIOCK.CHANGES.Errors.noAddPath"));
          return;
        }
        const changes =
          foundry.utils.deepClone(
            foundry.utils.getProperty(this.document, valuePath),
          ) || [];
        const newChange = {
          key: "",
          mode: 0,
          value: "",
          priority: 0,
        };
        changes.push(newChange);
        const updateData = { [path]: changes };
        await this.document.update(updateData);
      }

      /**
       * Deletes a change at any specified path.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}

       */
      static async _onDeleteChange(_event, target) {
        const index = parseInt(target.dataset.index, 10);
        const path = target.dataset.path;
        let valuePath = target.dataset.valuePath;
        if (!(typeof valuePath === "string")) valuePath = path;
        if (!path) {
          console.error(
            game.i18n.localize("TERIOCK.CHANGES.Errors.noDeletePath"),
          );
          return;
        }
        const changes = foundry.utils.deepClone(
          foundry.utils.getProperty(this.document, valuePath),
        );
        if (!changes || !Array.isArray(changes)) {
          console.error(
            game.i18n.format("TERIOCK.CHANGES.Errors.noDeleteArray", {
              path: valuePath,
            }),
          );
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
