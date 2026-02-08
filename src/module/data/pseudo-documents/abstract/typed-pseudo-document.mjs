import { selectDialog } from "../../../applications/dialogs/select-dialog.mjs";
import PseudoDocument from "./pseudo-document.mjs";

const { fields } = foundry.data;

export default class TypedPseudoDocument extends PseudoDocument {
  /**
   * The key for this pseudo-document's type.
   * @returns {string}
   */
  static get TYPE() {
    return "";
  }

  /**
   * Subtypes of this pseudo-document.
   * @returns {Record<string, TypedPseudoDocument>}
   */
  static get TYPES() {
    return Object.values(this.documentConfig).reduce(
      (acc, { documentClass }) => {
        if (documentClass.TYPE) acc[documentClass.TYPE] = documentClass;
        return acc;
      },
      {},
    );
  }

  static get documentConfig() {
    return teriock.CONFIG[this.metadata.documentName];
  }

  static get typeConfig() {
    return this.documentConfig[this.TYPE];
  }

  /**
   * @param {object} [options]
   * @param {GenericCommon | CommonSystem} parent
   * @param {string[]} [options.allowedTypes]
   * @returns {Promise<void>}
   */
  static async createDialog({ parent, ...options } = {}) {
    const { allowedTypes = [] } = options;
    const labelMap = {};
    Object.entries(this.documentConfig).forEach(([type, config]) => {
      if (allowedTypes.length === 0 || allowedTypes.includes(type)) {
        labelMap[type] = config.label;
      }
    });
    const type = await selectDialog(labelMap);
    await this.create({ type }, { parent });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      type: new fields.DocumentTypeField(this),
    });
  }

  /**
   * Label for this pseudo-document.
   * @returns {string}
   */
  get label() {
    return this.constructor.typeConfig["label"] || "";
  }
}
