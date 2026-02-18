import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import HarmSheet from "./harm-sheet.mjs";

export default class DamageSheet extends HarmSheet {
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(icons.effect.damage, "title"),
    },
  };
}
