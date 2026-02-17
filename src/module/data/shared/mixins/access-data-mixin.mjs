/**
 * Mixin to ensure data models have access to the data they need.
 * @param {typeof DataModel | typeof TypeDataModel} Base
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
       * This data model's actor.
       * @returns {GenericActor}
       */
      get actor() {
        return this.parent.actor;
      }

      /**
       * This data model's document.
       * @returns {GenericCommon}
       */
      get document() {
        return this.parent.document;
      }

      /**
       * Path to this data model.
       * @returns {string}
       */
      get localPath() {
        return this.schema.fieldPath;
      }

      /**
       * The UUID of this data model's document.
       * @returns {string}
       */
      get uuid() {
        return this.document.uuid;
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
       * Make form groups from specified field paths.
       * @param {string[]} paths
       * @returns {HTMLDivElement[]}
       */
      _makeFormGroups(paths) {
        return paths.map((p) =>
          this.schema.getField(p).toFormGroup(
            { rootId: foundry.utils.randomID() },
            {
              name: `${this.localPath}.${p}`,
              value: foundry.utils.getProperty(this, p),
            },
          ),
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
        return this.parent.getRollData();
      }
    }
  );
}
