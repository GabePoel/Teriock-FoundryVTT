import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { ArmamentExecution } from "../../../executions/document-executions/_module.mjs";
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
 * @constructor
 */
export default function ArmamentDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
  return (
    /**
     * @implements {ArmamentDataMixinInterface}
     * @mixin
     */
    class ArmamentData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          armament: true,
        });
      }

      /**
       * @inheritDoc
       * @returns {Record<string, DataField>}
       */
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          attackPenalty: modifiableFormula({
            deterministic: false,
            initial: "-3",
          }),
          av: modifiableNumber(),
          bv: modifiableNumber(),
          damage: new fields.SchemaField({
            base: modifiableFormula({
              deterministic: false,
            }),
            types: new fields.SetField(new fields.StringField()),
          }),
          description: new TextField({
            initial: "",
            label: "Description",
          }),
          fightingStyle: new fields.StringField({
            initial: null,
            label: "Style Bonus",
            nullable: true,
            choices: TERIOCK.index.weaponFightingStyles,
          }),
          flaws: new TextField({
            initial: "",
            label: "Flaws",
          }),
          notes: new TextField({
            initial: "",
            label: "Notes",
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
          range: new fields.SchemaField({
            long: modifiableFormula(),
            melee: new fields.BooleanField({
              initial: true,
              label: "Melee",
            }),
            ranged: new fields.BooleanField({
              initial: false,
              label: "Ranged",
            }),
            short: modifiableFormula(),
          }),
          spellTurning: new fields.BooleanField({
            initial: false,
            label: "Spell Turning",
            nullable: false,
          }),
          warded: new fields.BooleanField({
            initial: false,
            label: "Warded",
            nullable: false,
          }),
          virtualProperties: new fields.SetField(new fields.StringField()),
        });
      }

      /**
       * Summary of attack stats.
       * @returns {string}
       */
      get summarizedAttack() {
        return `${this.damage.base.value || 0} damage`;
      }

      /**
       * Summary of block stats.
       * @returns {string}
       */
      get summarizedBlock() {
        return `${this.bv.value} BV`;
      }

      /** @inheritDoc */
      get useIcon() {
        return getRollIcon(this.damage.base.value);
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      parseEvent(event) {
        const options = super.parseEvent(event);
        Object.assign(options, {
          crit: event.altKey,
        });
        return options;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        prepareModifiableBase(this.av);
        prepareModifiableBase(this.bv);
        prepareModifiableBase(this.damage.base);
        prepareModifiableBase(this.attackPenalty);
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
        deriveModifiableIndeterministic(this.attackPenalty);
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
        if (!this.damage.base.value || this.damage.base.value === "0") {
          this.range.melee = false;
        }
      }

      /**
       * @inheritDoc
       * @param {Teriock.Execution.ArmamentExecutionOptions} options
       */
      async roll(options = {}) {
        if (game.settings.get("teriock", "rollAttackOnArmamentUse")) {
          await this.actor?.useAbility("Basic Attack");
        }
        options.source = this.parent;
        const execution = new ArmamentExecution(options);
        await execution.execute();
      }
    }
  );
}
