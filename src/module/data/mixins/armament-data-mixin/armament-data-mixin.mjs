import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import {
  deriveModifiableIndeterministic,
  deriveModifiableNumber,
  modifiableFormula,
  modifiableNumber,
  prepareModifiableBase,
} from "../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildTypeModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ArmamentDataMixinInterface}
     * @extends {ChildTypeModel}
     */
    class ArmamentDataMixin extends Base {
      /**
       * @inheritDoc
       * @returns {Record<string, DataField>}
       */
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          av: modifiableNumber(),
          bv: modifiableNumber(),
          damage: new fields.SchemaField({
            base: modifiableFormula({
              deterministic: false,
            }),
            types: new fields.SetField(new fields.StringField()),
          }),
          fightingStyle: new fields.StringField({
            initial: null,
            label: "Style Bonus",
            nullable: true,
            choices: TERIOCK.index.weaponFightingStyles,
          }),
          description: new TextField({
            initial: "",
            label: "Description",
          }),
          flaws: new TextField({
            initial: "",
            label: "Flaws",
          }),
          notes: new TextField({
            initial: "",
            label: "Notes",
          }),
          spellTurning: new fields.BooleanField({
            initial: false,
            label: "Spell Turning",
            nullable: false,
          }),
          piercing: new fields.SchemaField({
            av0: new fields.BooleanField({
              initial: false,
              nullable: false,
              required: false,
            }),
            ub: new fields.BooleanField({
              initial: false,
              nullable: false,
              required: false,
            }),
          }),
          virtualProperties: new fields.SetField(new fields.StringField()),
        });
      }

      /** @inheritDoc */
      get useIcon() {
        return getRollIcon(this.damage.base.value);
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        prepareModifiableBase(this.av);
        prepareModifiableBase(this.bv);
        prepareModifiableBase(this.damage.base);
        if (this.damage.base.saved.trim() === "0") {
          this.damage.base.raw = "";
        }
        this.piercing = {
          av0: false,
          ub: false,
        };
        this.warded = false;
        this.hookedMacros =
          /** @type {Teriock.Parameters.Equipment.HookedEquipmentMacros} */ {};
        for (const pseudoHook of Object.keys(propertyPseudoHooks)) {
          this.hookedMacros[pseudoHook] = [];
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.fightingStyle && this.fightingStyle.length > 0) {
          this.specialRules =
            TERIOCK.content.weaponFightingStyles[this.fightingStyle];
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        deriveModifiableNumber(this.av, {
          floor: true,
          min: 0,
        });
        deriveModifiableNumber(this.bv, {
          floor: true,
          min: 0,
        });
        deriveModifiableIndeterministic(this.damage.base);
        if (this.piercing.ub) {
          this.piercing.av0 = true;
        }
      }
    }
  );
};
