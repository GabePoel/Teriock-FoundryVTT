import { documentConfig } from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

export default class extends ApplicableEffectSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.imbuement.icon, "title") } };
}
