import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";

/**
 * @param {typeof UsableData} Base
 */
export default function ThresholdDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class ThresholdData extends Base {
      /** @inheritDoc */
      static parseEvent(event) {
        return Object.assign(
          super.parseEvent(event),
          ThresholdRoll.parseEvent(event),
        );
      }
    }
  );
}
