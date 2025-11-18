import { fancifyFields, getSchema } from "../../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";

export default function ChildSheetMixin(Base) {
  return (
    /**
     * @property {TeriockChild} document
     * @mixes CommonSheet
     */
    class ChildSheetMixin extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          populateField: this._populateField,
        },
      };

      /**
       * Populate a display field.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @private
       */
      static async _populateField(_event, target) {
        await this.document.update({
          [target.dataset.path]: "<p>Add text here.</p>",
        });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareDisplayFields(context);
        return context;
      }

      /**
       * Prepare display fields.
       * @param {object} context
       * @returns {Promise<void>}
       * @private
       */
      async _prepareDisplayFields(context) {
        /** @type {Teriock.Sheet.FancyDisplayField[]} */
        const fancyDisplayFields = fancifyFields(
          this.document.system.displayFields,
        );
        const expandedDisplayFields = fancyDisplayFields.map((f) => {
          return {
            path: f.path,
            classes: f.classes,
            value: foundry.utils.getProperty(this.document, f.path),
            schema: getSchema(this.document, f.path),
            editable: f.editable,
            label: f.label,
          };
        });
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
                  schema: f.schema,
                  classes: f.classes,
                  value: f.value,
                  enriched: await TeriockTextEditor.enrichHTML(f.value),
                  editable: f.editable,
                  label: f.label || f.schema.label,
                };
              }),
          );
        context.displayFieldButtons = displayFieldButtons;
      }
    }
  );
}
