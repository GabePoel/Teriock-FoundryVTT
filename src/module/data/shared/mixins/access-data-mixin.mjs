/**
 * Mixin to ensure data models have access to the data they need.
 * @param {typeof DataModel | typeof TypeDataModel} Base
 * @property {AccessData} parent
 */
export default function AccessDataMixin(Base) {
  return (
    /**
     * @extends {DataModel | TypeDataModel}
     * @mixin
     */
    class AccessData extends Base {
      /**
       * Paths to forms to display in the editor.
       * @returns {string[]}
       */
      get _formPaths() {
        return [];
      }

      /**
       * A key for what roll editor context to use when building forms.
       * @returns {string}
       */
      get _inputContextKey() {
        return "actor";
      }

      /**
       * This data model's actor.
       * @returns {AnyActor}
       */
      get actor() {
        return this.parent?.actor;
      }

      /**
       * This data model's document.
       * @returns {AnyCommonDocument}
       */
      get document() {
        return this.parent?.document;
      }

      /**
       * Path to this data model.
       * @returns {string}
       */
      get localPath() {
        return this.schema.fieldPath;
      }

      /**
       * Forms that go into a simple editor for this data model.
       * @returns {Promise<HTMLDivElement>}
       */
      async _getEditorForms() {
        const group = document.createElement("div");
        group.classList.add("teriock-form-container");
        this._makeFormGroups(this._formPaths).forEach((fg) => group.append(fg));
        return group;
      }

      /**
       * Make a form group from the specified field path.
       * @param {string} path
       * @param {FormGroupConfig} groupConfig
       * @param {FormInputConfig} inputConfig
       * @returns {HTMLDivElement}
       */
      _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
        return this.schema.getField(path).toFormGroup(
          { rootId: foundry.utils.randomID(), localize: true, ...groupConfig },
          {
            context: this._inputContextKey,
            name: `${this.localPath}.${path}`,
            value: foundry.utils.getProperty(this, `_source.${path}`),
            ...inputConfig,
          },
        );
      }

      /**
       * Make form groups from specified field paths.
       * @param {string[]} paths
       * @returns {HTMLElement[]}
       */
      _makeFormGroups(paths) {
        return paths.map((p) =>
          p === "hr" ? document.createElement("hr") : this._makeFormGroup(p),
        );
      }

      /**
       * A simple editor for this data model.
       * @returns {Promise<HTMLDivElement>}
       */
      async getEditor() {
        return this._getEditorForms();
      }

      /**
       * Roll data specific to this data model.
       * @returns {object}
       */
      getLocalRollData() {
        return {};
      }

      /**
       * Recursively fetch roll data.
       * @returns {object}
       */
      getRollData() {
        return this.parent?.getRollData() || {};
      }
    }
  );
}
