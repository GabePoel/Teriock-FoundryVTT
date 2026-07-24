import { DocumentSelector } from "../../../../../../applications/dialogs/_module.mjs";
import { consolidateWriteOperations } from "../../../../../../helpers/utils.mjs";
import { initialNumber } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles limits.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorLimitsPart(Base) {
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
          curses: new fields.SchemaField({
            max: new fields.NumberField({ initial: 3, integer: true, min: 0, nullable: false }),
            min: initialNumber(),
            value: initialNumber(),
          }),
          rotators: new fields.SchemaField({
            max: new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false }),
            min: initialNumber(),
            value: initialNumber(),
          }),
        });
      }

      /**
       * The curses that count towards the maximum value.
       * @returns {TeriockPower[]}
       */
      get curseDocuments() {
        return this.parent.powers.filter(p => p.system.type === "curse");
      }

      /**
       * The rotators that count towards the maximum value.
       * @returns {TeriockAbility[]}
       */
      get rotatorDocuments() {
        return this.parent.abilities.filter(a =>
          a.system.rotator && !a.isReference && (!a.parent || ["power", "rank"].includes(a.parent.type))
        );
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.curses.value = this.curseDocuments.filter(c => c.active).length;
        this.rotators.value = this.rotatorDocuments.filter(r => r.active).length;
      }
    }
  );
}
