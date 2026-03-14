import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { IconFieldMixin } from "./_module.mjs";

const { NumberField } = foundry.data.fields;

/**
 * @extends {NumberField}
 * @mixes IconField
 */
export default class EnhancedNumberField extends IconFieldMixin(NumberField) {
  /**
   * We use {@link BaseRoll} instead of the Foundry's default roll so that we can handle infinities.
   * @inheritDoc
   */
  _castChangeDelta(raw, replacementData) {
    if (typeof raw === "string") {
      raw = BaseRoll.create(
        this._replaceDataRefs(raw, replacementData),
      ).evaluateSync().total;
    }
    return super._castChangeDelta(raw);
  }
}
