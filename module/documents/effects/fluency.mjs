import { rollFluency } from "../../logic/rollers/fluency.mjs";
import TeriockBaseEffect from "./base.mjs";
import TeriockWikiMixin from "../mixins/wiki-mixin.mjs";

export default class TeriockFluency extends TeriockWikiMixin(TeriockBaseEffect) {

  /** @override */
  getWikiPage() {
    return `Tradecraft:${CONFIG.TERIOCK.tradecraftOptions[this.system.field].tradecrafts[this.system.tradecraft].name}`;
  }

  /** @override */
  async roll(options) {
    await rollFluency(this, options);
  }
}