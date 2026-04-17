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
       * Make form groups from specified field paths.
       * @param {string[]} paths
       * @returns {HTMLDivElement[]}
       */
      _makeFormGroups(paths) {
        return paths.map((p) => {
          if (p === "hr") return document.createElement("hr");
          return this.schema.getField(p).toFormGroup(
            { rootId: foundry.utils.randomID(), localize: true },
            {
              context: this._inputContextKey,
              name: `${this.localPath}.${p}`,
              value: foundry.utils.getProperty(this, p),
            },
          );
        });
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
