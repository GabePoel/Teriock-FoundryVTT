import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles automation.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorAutomationPartData}
     * @mixin
     */
    class ActorAutomationPart extends Base {
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          conditionInformation: new fields.SchemaField(
            objectMap(TERIOCK.index.conditions, () => {
              return new fields.SchemaField({
                locked: new fields.BooleanField(),
                reasons: new fields.SetField(new fields.StringField()),
                trackers: new fields.SetField(new fields.DocumentUUIDField()),
              });
            }),
            { persisted: false },
          ),
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
