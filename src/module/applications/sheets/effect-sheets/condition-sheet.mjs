import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockCondition} sheet.
 * @property {TeriockCondition} document
 */
export default class ConditionSheet extends ActiveEffectConfig {
  static DEFAULT_OPTIONS = {
    classes: ["condition"],
    window: {
      icon: makeIconClass(documentOptions.condition.icon, "title"),
    },
  };
}
