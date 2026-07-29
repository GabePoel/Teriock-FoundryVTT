import { FormulaField } from "../../../fields/_module.mjs";
import { PiercingModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @template {Constructor<ChildSystem>} T
 * @param {T} Base
 */
export default function AttackSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @extends {Teriock.Models.AttackSystemData}
     * @mixin
     */
    class AttackSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Attack"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          attackPenalty: new FormulaField({ blank: false, deterministic: false, initial: "-3", placeholder: "-3" }),
          hitBonus: new FormulaField({ deterministic: false, placeholder: _loc("COMMON.None") }),
          piercing: new fields.EmbeddedDataField(PiercingModel),
          warded: new fields.BooleanField(),
        });
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          ap: this.attackPenalty || 0,
          av0: Number(this.piercing.av0),
          hit: this.hitBonus || 0,
          ub: Number(this.piercing.ub),
          warded: Number(this.warded),
        });
      }
    }
  );
}
