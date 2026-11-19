import { HTMLElderSorceryWordsElement } from "../../applications/elements/_module.mjs";
import ElderSorceryWordsModel from "../models/elder-sorcery-words-model/elder-sorcery-words-model.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Special case {@link EmbeddedDataField} for an {@link ElderSorceryWordsModel}.
 * @category Sorcery
 */
export default class ElderSorceryWordsField extends EmbeddedDataField {
  /**
   * @param {DataFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options, context) {
    super(ElderSorceryWordsModel, options, context);
  }

  /** @inheritDoc */
  _toInput(config) {
    return HTMLElderSorceryWordsElement.create(config);
  }
}
