const { FormDataExtended } = foundry.applications.ux;

/**
 * Mixin for short-lived applications.
 * @param {typeof ApplicationV2 & typeof BaseApplication} Base
 */
export default function TemporaryApplicationMixin(Base) {
  return (
    /**
     * @extends {ApplicationV2 & BaseApplication}
     * @property {Record<string, any>} state - State data automatically updated in {@link _onChangeForm}.
     * @mixin
     */
    class TemporaryApplication extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        doubles: { openDocument: this._onDoubleClickOpenDocument },
        form: { closeOnSubmit: false, submitOnChange: false },
      };

      /**
       * Open a document sheet when a row is double-clicked.
       * @param {MouseEvent} _event
       * @param {HTMLElement} target
       * @this {TemporaryApplication}
       */
      static async _onDoubleClickOpenDocument(_event, target) {
        const row = /** @type {HTMLElement|null} */ (target.closest("[data-uuid]") ?? target);
        if (!row?.dataset.uuid) { return; }
        const doc = /** @type {AnyChildDocument} */ await fromUuid(row.dataset.uuid);
        await doc?.sheet?.render(true);
      }

      /**
       * Record of registered models.
       * @type {Record<string, typeof BaseDataModel>}
       */
      models = {};

      /**
       * State data bound to form fields via `name="state.<path>"`.
       * @type {Record<string, any>}
       */
      state = {};

      /** @inheritDoc */
      _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        if (!this.state) { return; }
        const target = /** @type {HTMLElement} */ (event.target);
        const form = /** @type {HTMLFormElement} */ (target.form ?? this.form ?? event.currentTarget);
        const formData = new FormDataExtended(form);
        const data = typeof this._processFormData === "function"
          ? this._processFormData(event, form, formData)
          : foundry.utils.expandObject(formData.object);
        if (foundry.utils.hasProperty(data, "state")) {
          foundry.utils.mergeObject(this.state, data.state, { inplace: true });
        }
        this._onStateChanged(event, data);
      }

      /** @inheritDoc */
      _onPressKey(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      }

      /**
       * Hook called after {@link TemporaryApplication.state} is updated from the form.
       * @param {Event} _event
       * @param {object} _data
       */
      _onStateChanged(_event, _data) {}

      /**
       * Prepare fields for a registered data model. Only works with flat data models without nested schema. Every model
       * must be registered using {@link _registerModelFields.}
       * @param {string} id
       * @returns {{field: DataField, name: string, value: *}[]}
       */
      _prepareModelFields(id) {
        return Object.entries(this.models[id].schema.fields).map(([name, field]) => ({
          field,
          name: `state.${id}.${name}`,
          value: this.state[id][name],
        }));
      }

      /**
       * Register fields from a data model.
       * @param {typeof BaseDataModel} Model
       * @param {string} id
       */
      _registerModelFields(Model, id) {
        this.models[id] = Model;
        this.state[id] = new Model().toObject();
      }
    }
  );
}
