import { rollResource } from "../../logic/rollers/resource.mjs";
import TeriockBaseEffect from "./base.mjs";
import TeriockConsumableMixin from "../mixins/consumable-mixin.mjs";

export default class TeriockResource extends TeriockConsumableMixin(TeriockBaseEffect) {

  /** @override */
  async roll(options) {
    await rollResource(this, options);
  }
}