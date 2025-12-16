import { propertyPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { ArmamentExecution } from "../../../executions/document-executions/_module.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof TeriockBaseItemModel} Base
 */
export default function ArmamentDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
  return (
    /**
     * @implements {ArmamentDataMixinInterface}
     * @extends {TeriockBaseItemModel}
     * @mixin
     */
    class ArmamentData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          armament: true,
          childEffectTypes: ["ability", "fluency", "property", "resource"],
          visibleTypes: ["ability", "fluency", "property", "resource"],
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          attackPenalty: new EvaluationField({
            deterministic: false,
            initial: "-3",
            blank: "-3",
          }),
          av: new EvaluationField({
            floor: true,
            min: 0,
          }),
          bv: new EvaluationField({
            floor: true,
            min: 0,
          }),
          damage: new fields.SchemaField({
            base: new EvaluationField({
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
          hit: new EvaluationField({
            floor: true,
            deterministic: false,
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
            long: new EvaluationField(),
            melee: new fields.BooleanField({
              initial: true,
              label: "Melee",
            }),
            ranged: new fields.BooleanField({
              initial: false,
              label: "Ranged",
            }),
            short: new EvaluationField(),
          }),
          specialRules: new TextField({
            initial: "",
            label: "Fighting Style",
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
        });
      }

      /** @inheritDoc */
      get displayFields() {
        return [
          "system.description",
          "system.notes",
          "system.flaws",
          {
            classes: "italic-display-field",
            editable: false,
            label: `${TERIOCK.index.weaponFightingStyles[this.fightingStyle]} Fighting Style`,
            path: "system.specialRules",
          },
        ];
      }

      /**
       * Summary of attack stats.
       * @returns {string}
       */
      get summarizedAttack() {
        return `${this.damage.base.formula} damage`;
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
        return getRollIcon(this.damage.base.formula);
      }

      /**
       * @inheritDoc
       * @param {Teriock.Execution.ArmamentExecutionOptions} options
       */
      async _use(options = {}) {
        if (game.settings.get("teriock", "rollAttackOnArmamentUse")) {
          await this.actor?.useAbility("Basic Attack");
        }
        options.source = /** @type {TeriockArmament} */ this.parent;
        const execution = new ArmamentExecution(options);
        await execution.execute();
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          dmg: this.damage.base.formula,
          range: this.range.long.formula,
          "range.short": this.range.short.formula,
          "range.melee": this.range.melee,
          "range.ranged": this.range.ranged,
          av: this.av.formula,
          bv: this.bv.formula,
          hit: this.hit.formula,
        });
        for (const type of this.damage.types) {
          data[`dmg.type.${type}`] = 1;
        }
        foundry.utils.deleteProperty(data, "damage");
        const propertyKeys = this.parent.effectKeys.property;
        if (propertyKeys) {
          for (const p of propertyKeys) {
            data[`prop.${p}`] = 1;
          }
        }
        return data;
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      parseEvent(event) {
        const options =
          /** @type {Teriock.Execution.ArmamentExecutionOptions} */
          super.parseEvent(event);
        Object.assign(options, {
          crit: event.altKey,
        });
        return options;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
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
        this.av.evaluate();
        this.bv.evaluate();
        this.hit.evaluate();
        if (this.piercing.ub) {
          this.piercing.av0 = true;
        }
        if (!this.damage.base.nonZero) {
          this.range.melee = false;
        }
      }
    }
  );
}
