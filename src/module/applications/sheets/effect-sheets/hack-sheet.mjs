import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import ApplicableEffectSheet from "./applicable-effect-sheet.mjs";

const inheritedParts = { ...ApplicableEffectSheet.PARTS };
delete inheritedParts.children;

export default class CustomEffectSheet extends ApplicableEffectSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ui.hack, "title") } };

  /** @inheritDoc */
  static PARTS = { ...inheritedParts };

  /** @inheritDoc */
  static TABS = { sheet: { ...super.TABS.sheet, tabs: super.TABS.sheet.tabs.filter(tab => tab.id !== "children") } };
}
