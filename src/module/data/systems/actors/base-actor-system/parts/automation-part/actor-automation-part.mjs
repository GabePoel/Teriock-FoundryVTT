/**
 * Actor data model that handles automation.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorAutomationPartInterface}
     * @mixin
     */
    class ActorAutomationPart extends Base {
      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.conditionInformation =
          /** @type {Teriock.Parameters.Actor.ConditionInformation} */ {};
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
