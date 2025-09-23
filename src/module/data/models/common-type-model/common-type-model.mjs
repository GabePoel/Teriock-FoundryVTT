import { freeze } from "../../../helpers/utils.mjs";

const { TypeDataModel } = foundry.abstract;

export default class CommonTypeModel extends TypeDataModel {
  /**
   * Metadata.
   * @type {Readonly<Teriock.Documents.ModelMetadata>}
   */
  static metadata = freeze({
    type: "base",
    childEffectTypes: [],
    childItemTypes: [],
    childMacroTypes: [],
  });

  /**
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
  }

  /**
   * Type-specific changes to the name string.
   * @returns {string}
   */
  get nameString() {
    return this.parent.name;
  }

  /**
   * @inheritDoc
   * @returns {TeriockCommon}
   */
  get parent() {
    return /** @type {TeriockCommon} */ super.parent;
  }

  /**
   * Apply transformations of derivations to the values of the source data object. Compute data fields whose values are
   * not stored to the database. This happens after the actor has completed all operations.
   */
  prepareSpecialData() {}
}
