import { HTMLElderSorceryWordsElement } from "../../applications/elements/_module.mjs";
import ElderSorceryWordsTable from "../models/elder-sorcery-words-table/elder-sorcery-words-table.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Special case {@link EmbeddedDataField} for an {@link ElderSorceryWordsTable}.
 */
export default class ElderSorceryWordsField extends EmbeddedDataField {
  /**
   * @param {DataFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options, context) {
    super(ElderSorceryWordsTable, options, context);
  }

  /** @inheritDoc */
  _toInput(config) {
    return HTMLElderSorceryWordsElement.create(config);
  }
}
