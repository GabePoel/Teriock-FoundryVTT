import { objectMap } from "../../../../../../helpers/utils.mjs";

/**
 * Actor data model that handles automation.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorAutomationPartData}
     * @mixin
     */
    class ActorAutomationPart extends Base {
      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.conditionInformation = objectMap(TERIOCK.index.conditions, () => {
          return {
            locked: false,
            reasons: new Set(),
            trackers: new Set(),
          };
        });
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
