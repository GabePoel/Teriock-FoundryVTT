import systemConfig from "../../../../../../constants/config/system-config.mjs";
import { InfiniteNumberField } from "../../../../../fields/_module.mjs";
import { initialNumber } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles limits.
 *
 * Relevant wiki pages:
 * - [Curse](https://wiki.teriock.com/index.php/Keyword:Curse)
 * - [Rotator Fluency](https://wiki.teriock.com/index.php/Ability:Rotator_Fluency)
 * - [Rotators](https://wiki.teriock.com/index.php/Ability:Rotators)
 *
 * @template {Constructor<BaseActorSystem>} T
 * @param {T} Base
 */
export default function ActorLimitsPart(Base) {
  /**
   * @extends {CommonSystem}
   * @extends {Teriock.Models.ActorLimitsPartData}
   * @mixin
   * @property {AnyActor} parent
   */
  class ActorLimitsPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        curses: new fields.SchemaField({
          max: new InfiniteNumberField({ initial: systemConfig.baseValues.maxCurses, integer: true }),
          min: initialNumber(),
          value: initialNumber(),
        }),
        rotators: new fields.SchemaField({
          max: new InfiniteNumberField({ initial: 0, integer: true }),
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

  return ActorLimitsPart;
}
