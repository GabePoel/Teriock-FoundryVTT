import { documentOptions } from "../../../constants/options/document-options.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockAttunement} sheet.
 * @property {TeriockAttunement} document
 */
export default class AttunementSheet extends ActiveEffectConfig {
  static DEFAULT_OPTIONS = {
    classes: ["attunement"],
    window: {
      icon: makeIconClass(documentOptions.attunement.icon, "title"),
    },
  };
}
