import { fancifyFields } from "../../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";

/**
 * {@link TeriockChild} sheet mixin.
 * @param {typeof CommonSheet} Base
 */
export default function ChildSheetMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {CommonSheet}
     * @mixes ConfigButtonSheet
     * @mixin
     * @property {TeriockChild} document
     */
    class ChildSheet extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          populateField: this._onPopulateField,
        },
      };

      /**
       * Populate a display field.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _onPopulateField(_event, target) {
        await this.document.update({
          [target.dataset.path]: "<p>Add text here.</p>",
        });
      }

      /**
       * Expand fancy display fields into their schema and value.
       * @param {Teriock.Sheet.FancyDisplayField[]} fields
       * @returns {(Teriock.Sheet.FancyDisplayField & { schema: DataSchema; value: any })[]}
       */
      #expandFields(fields) {
        return fancifyFields(fields).map((f) => {
          return {
            ...f,
            ...{
              schema: this.document.getSchema(f.path),
              value: foundry.utils.getProperty(
                this.document,
                f.path.replace(".system.", "._schema.system."),
              ),
              label: f.label || this.document.getSchema(f.path).label,
            },
          };
        });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareDisplayFields(context);
        context.displayToggles = this.#expandFields(
          this.document.system.displayToggles,
        );
        return context;
      }

      /**
       * Prepare display fields.
       * @param {object} context
       * @returns {Promise<void>}
       * @private
       */
      async _prepareDisplayFields(context) {
        const expandedDisplayFields = this.#expandFields(
          this.document.system.displayFields,
        );
        const displayFieldButtons = expandedDisplayFields
          .filter((f) => !f.value)
          .map((f) => {
            return {
              fieldPath: f.path,
              name: f.label || f.schema.label,
              editable: f.editable,
            };
          });
        context.displayFields =
          /** @type {Teriock.Sheet.EnrichedDisplayField[]} */ await Promise.all(
            expandedDisplayFields
              .filter((f) => f.value)
              .map(async (f) => {
                return {
                  ...f,
                  enriched: await TeriockTextEditor.enrichHTML(f.value, {
                    relativeTo: this.document,
                  }),
                };
              }),
          );
        context.displayFieldButtons = displayFieldButtons;
      }
    }
  );
}
