/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function ThresholdDataMixin(Base) {
  return class ThresholdData extends Base {
    /**
     * @inheritDoc
     * @param {PointerEvent} event
     * @returns {Teriock.Execution.ThresholdExecutionOptions & Teriock.Execution.DocumentExecutionOptions}
     */
    parseEvent(event) {
      const options = super.parseEvent(event);
      Object.assign(options, {
        advantage: event.altKey,
        disadvantage: event.shiftKey,
      });
      return options;
    }
  };
}
