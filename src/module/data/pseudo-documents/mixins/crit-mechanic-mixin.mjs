import { localizeChoices } from "../../../helpers/localization.mjs";

const { fields } = foundry.data;

/**
 * Adds critical-hit gating to a {@link MechanicPseudoDocument}.
 * @param {typeof MechanicPseudoDocument} Base
 * @constructor
 */
export default function CritMechanicMixin(Base) {
  return (
    /**
     * @extends {MechanicPseudoDocument}
     * @mixin
     * @property {Set<number>} crit
     */
    class CritMechanic extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          crit: new fields.SetField(
            new fields.NumberField({
              choices: localizeChoices({
                0: "TERIOCK.AUTOMATIONS.Crit.FIELDS.crit.choices.0",
                1: "TERIOCK.AUTOMATIONS.Crit.FIELDS.crit.choices.1",
              }, { sort: false }),
            }),
            { initial: [0, 1] },
          ),
        });
      }

      /** @inheritDoc */
      get canCrit() {
        if (this.document.type === "ability") { return true; }
        return super.canCrit;
      }
    }
  );
}
