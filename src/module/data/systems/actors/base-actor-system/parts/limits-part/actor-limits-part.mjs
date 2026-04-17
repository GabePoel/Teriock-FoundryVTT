import {
  initialBar,
  initialNumber,
} from "../../../../../fields/helpers/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles limits.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorLimitsPartData}
     * @mixin
     */
    class ActorLimitsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          curses: initialBar({ max: 3 }),
          rotators: new fields.SchemaField({
            min: initialNumber(),
            max: new fields.NumberField({ initial: 0, nullable: false }),
            value: initialNumber(),
          }),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.curses.value = this.parent.powers.filter(
          (p) => p.system.type === "curse" && !p.disabled,
        ).length;
        this.rotators.value = this.parent.abilities.filter(
          (a) =>
            a.active &&
            !a.isReference &&
            (!a.parent || ["power", "rank"].includes(a.parent.type)) &&
            a.system.rotator,
        ).length;
      }
    }
  );
};
