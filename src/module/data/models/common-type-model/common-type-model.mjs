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
}
