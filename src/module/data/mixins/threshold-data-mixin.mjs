import { ThresholdRoll } from "../../dice/rolls/_module.mjs";

/**
 * @param {typeof UsableData} Base
 */
export default function ThresholdDataMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class ThresholdData extends Base {
      /** @inheritDoc */
      static parseEvent(event, source) {
        const parsed = super.parseEvent(event, source);
        parsed.data.edge = ThresholdRoll.parseEvent(event).edge;
        return parsed;
      }
    }
  );
}
