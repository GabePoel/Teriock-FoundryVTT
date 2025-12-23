/**
 * @param {typeof ChildTypeModel} Base
 */
export default function ThresholdDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildTypeModel}
     * @mixin
     */
    class ThresholdData extends Base {
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
    }
  );
}
