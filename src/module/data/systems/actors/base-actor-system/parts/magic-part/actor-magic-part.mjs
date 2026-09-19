import systemConfig from "../../../../../../constants/config/system-config.mjs";
import { ElderSorceryExecution } from "../../../../../../executions/actor-executions/_module.mjs";
import { InfiniteNumberField } from "../../../../../fields/_module.mjs";
import { elderSorceryCreationSchema } from "../../../../../fields/tools/builders.mjs";
import { initialNumber } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles magic stuff.
 *
 * Relevant wiki pages:
 * - [Curse](https://wiki.teriock.com/index.php/Keyword:Curse)
 * - [Elder Sorcery](https://wiki.teriock.com/index.php/Core:Elder_Sorcery)
 * - [Rotator Fluency](https://wiki.teriock.com/index.php/Ability:Rotator_Fluency)
 * - [Rotators](https://wiki.teriock.com/index.php/Ability:Rotators)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorMagicPart & Teriock.Models.ActorMagicPartData>}
 */
export default function ActorMagicPart(Base) {
  /**
   * @implements {Teriock.Models.ActorMagicPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorMagicPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        curses: new fields.SchemaField({
          max: new InfiniteNumberField({ initial: systemConfig.baseValues.maxCurses, integer: true }),
          min: initialNumber(),
          value: initialNumber(),
        }),
        elderSorceryCreation: new fields.SchemaField(elderSorceryCreationSchema()),
        rotators: new fields.SchemaField({
          max: new InfiniteNumberField({ initial: 0, integer: true }),
          min: initialNumber(),
          value: initialNumber(),
        }),
      });
    }

    /**
     * The curses that count towards the maximum value.
     * @returns {TeriockItem<"power">[]}
     */
    get curseDocuments() {
      return this.parent.previewedTypes.power.filter(p => p.system.kind === "curse");
    }

    /**
     * The rotators that count towards the maximum value.
     * @returns {TeriockActiveEffect<"ability">[]}
     */
    get rotatorDocuments() {
      return this.parent.previewedTypes.ability.filter(a =>
        a.system.rotator && !a.isReference && (!a.parent || ["power", "rank"].includes(a.parent.type))
      );
    }

    /**
     * Make the creation rolls for a new Elder Sorcery spell.
     * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
     * @returns {Promise<void>}
     */
    async createElderSorcery(options = {}) {
      await ElderSorceryExecution.create({}, Object.assign(options, { actor: this.parent, source: this.parent }));
    }

    /** @inheritDoc */
    prepareCleanupData() {
      super.prepareCleanupData();
      this.curses.value = this.curseDocuments.filter(c => c.active).length;
      this.rotators.value = this.rotatorDocuments.filter(r => r.active).length;
    }
  }

  return ActorMagicPart;
}
