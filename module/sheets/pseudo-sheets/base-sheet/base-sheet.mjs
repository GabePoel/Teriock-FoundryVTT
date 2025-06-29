import { TeriockSheet } from "../../mixins/sheet-mixin.mjs";
import PseudoApplication from "../pseudo-application.mjs";

export default class BasePseudoSheet extends TeriockSheet(PseudoApplication) {
  constructor(...args) {
    super(...args);
  }
}