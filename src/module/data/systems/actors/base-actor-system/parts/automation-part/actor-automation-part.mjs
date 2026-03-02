/**
 * Actor data model that handles automation.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorAutomationPartInterface}
     * @mixin
     */
    class ActorAutomationPart extends Base {
      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.conditionInformation = /** @type {ConditionInformation} */ {};
        for (const key of Object.keys(TERIOCK.index.conditions)) {
          this.conditionInformation[key] = {
            locked: false,
            reasons: new Set(),
            trackers: new Set(),
          };
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        for (const uuid of this.conditionInformation.allured.trackers) {
          this.conditionInformation.bound.trackers.add(uuid);
        }
      }
    }
  );
};
