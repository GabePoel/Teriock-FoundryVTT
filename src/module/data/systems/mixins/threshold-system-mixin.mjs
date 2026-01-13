/**
 * @param {typeof ChildSystem} Base
 */
export default function ThresholdSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class ThresholdSystem extends Base {
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
