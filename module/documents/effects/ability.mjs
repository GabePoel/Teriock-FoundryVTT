import { rollAbility } from "../../logic/rollers/ability.mjs";
import TeriockBaseEffect from "./base.mjs";
import TeriockWikiMixin from "../mixins/wiki-mixin.mjs";

export default class TeriockAbility extends TeriockWikiMixin(TeriockBaseEffect) { 
  
  /** @override */
  async roll(options) {
    await rollAbility(this, options);
  }
}