import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating a unit model's unit and raw value.
 * @property {AnyCommonDocument} document
 */
export default class UnitUpdater extends BaseUpdater {
  /**
   * @inheritDoc
   * @param {Partial<ApplicationConfiguration & {
   *   TeriockDocument: AnyCommonDocument,
   *   path: string,
   *   unitModel?: BaseUnitModel,
   * }>} options
   */
  constructor(options) {
    super({ ...options, paths: [`${options.path}.unit`, `${options.path}.raw`] });
    this.#unitPath = options.path;
    this.#unitModel = options.unitModel ?? foundry.utils.getProperty(this.document, this.#unitPath);
  }

  /** @type {BaseUnitModel} */
  #unitModel;

  /** @type {string} */
  #unitPath;

  /** @inheritDoc */
  get _formPaths() {
    const paths = [`${this.#unitPath}.unit`];
    const unit = foundry.utils.getProperty(this._currentData, `${this.#unitPath}.unit`);
    if (this.#unitModel.constructor.finiteChoiceEntries.some(e => e.id === unit)) {
      paths.push(`${this.#unitPath}.raw`);
    }
    return paths;
  }

  /** @inheritDoc */
  get _titlePrefix() {
    return this.#unitModel.schema.label;
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this.window.icon.className = makeIconClass(this.#unitModel.icon, "title");
  }
}
