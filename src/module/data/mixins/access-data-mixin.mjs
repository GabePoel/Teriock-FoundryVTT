import { createElement } from "../../helpers/html.mjs";

/**
 * @import { DataModel, TypeDataModel } from "@common/abstract/_module.mjs";
 * @import { FormGroupConfig, FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * Mixin to ensure data models have access to the data they need.
 * @template {Constructor<DataModel | TypeDataModel>} T
 * @param {T} Base
 * @returns {MixinResult<T, AccessData>}
 */
export default function AccessDataMixin(Base) {
  /** @mixin */
  class AccessData extends Base {
    /**
     * Data model metadata.
     * @returns {Teriock.Metadata.BaseMetadata}
     */
    static get metadata() {
      return { initialCompetence: 0, pseudos: {} };
    }

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
     * @returns {TeriockActor}
     */
    get actor() {
      return this.parent?.actor;
    }

    /**
     * Data model metadata.
     * @returns {Teriock.Metadata.BaseMetadata}
     */
    get metadata() {
      return this.constructor.metadata;
    }

    /**
     * Forms that go into a simple editor for this data model.
     * @param {Teriock.Fields.EditorConfig} [config]
     * @returns {Promise<HTMLDivElement>}
     */
    async _getEditorForms(config = {}) {
      return this._getEditorFormsSync(config);
    }

    /**
     * Synchronously get forms that go into a simple editor for this data model.
     * @param {Teriock.Fields.EditorConfig} [config]
     * @returns {HTMLDivElement}
     */
    _getEditorFormsSync(config = {}) {
      const group = createElement("div", { className: "teriock-form-container standard-form" });
      this._makeFormGroups(this._formPaths, config).forEach(fg => group.append(fg));
      return group;
    }

    /**
     * Make a form group from the specified field path.
     * @param {string} path
     * @param {FormGroupConfig} groupConfig
     * @param {FormInputConfig} inputConfig
     * @param {Teriock.Fields.EditorConfig} [config]
     * @returns {HTMLDivElement}
     */
    _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
      const gc = { localize: true, rootId: [config.rootId, this.localPath].filterJoin("-") };
      const ic = {
        context: this._inputContextKey,
        name: `${this.localPath}.${path}`,
        value: foundry.utils.getProperty(this, `_source.${path}`),
      };
      return this.getFieldForProperty(path).toFormGroup(Object.assign(gc, groupConfig), Object.assign(ic, inputConfig));
    }

    /**
     * Make form groups from specified field paths.
     * @param {string[]} paths
     * @param {Teriock.Fields.EditorConfig} [config]
     * @returns {HTMLElement[]}
     */
    _makeFormGroups(paths, config = {}) {
      return paths.map(p => (p === "hr" ? document.createElement("hr") : this._makeFormGroup(p, {}, {}, config)));
    }

    /**
     * A simple editor for this data model.
     * @param {Teriock.Fields.EditorConfig} [config]
     * @returns {Promise<HTMLDivElement>}
     */
    async getEditor(config = {}) {
      return this._getEditorForms(config);
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

  return AccessData;
}
