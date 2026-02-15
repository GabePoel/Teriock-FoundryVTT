import { propertyPseudoHooks } from "../../../../constants/system/pseudo-hooks.mjs";
import { ArmamentExecution } from "../../../../executions/document-executions/_module.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import { getRollIcon } from "../../../../helpers/utils.mjs";
import { EvaluationField, TextField } from "../../../fields/_module.mjs";
import {
  DamageModel,
  DefenseModel,
  RangeModel,
} from "../../../models/_module.mjs";
import { AttackSystemMixin } from "../_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function ArmamentSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
  return (
    /**
     * @extends {BaseItemSystem}
     * @implements {Teriock.Models.ArmamentSystemInterface}
     * @mixes PiercingSystem
     * @mixin
     */
    class ArmamentSystem extends AttackSystemMixin(Base) {
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
            deterministic: true,
            floor: true,
            min: 0,
            model: DefenseModel,
          }),
          bv: new EvaluationField({
            deterministic: true,
            floor: true,
            min: 0,
            model: DefenseModel,
          }),
          damage: new fields.SchemaField({
            base: new EvaluationField({
              deterministic: false,
              model: DamageModel,
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
          range: new fields.SchemaField({
            long: new EvaluationField({ model: RangeModel, label: "Range" }),
            melee: new fields.BooleanField({
              initial: true,
              label: "Melee",
            }),
            ranged: new fields.BooleanField({
              initial: false,
              label: "Ranged",
            }),
            short: new EvaluationField({
              model: RangeModel,
              label: "Short Range",
            }),
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
          vitals: new fields.BooleanField({
            initial: false,
            label: "Vitals",
            nullable: false,
          }),
        });
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      static parseEvent(event) {
        return Object.assign(super.parseEvent(event), {
          crit: event.ctrlKey,
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
      async _use(
        options = /** @type {Teriock.Execution.ArmamentExecutionOptions} */ {},
      ) {
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
          ap: this.attackPenalty.value,
          hit: this.hit.value,
          armament: 1,
          dmg: this.damage.base.formula,
          range: this.range.long.formula,
          "range.short": this.range.short.formula,
          "range.melee": Number(this.range.melee),
          "range.ranged": Number(this.range.ranged),
          av: this.av.value,
          bv: this.bv.value,
          style: this.fightingStyle,
          [`style.${this.fightingStyle}`]: 1,
          spellTurning: Number(this.spellTurning),
        });
        for (const type of this.damage.types) {
          data[`dmg.type.${type}`] = 1;
        }
        for (const p of this.props || new Set()) {
          data[`prop.${p}`] = 1;
        }
        return data;
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      parseEvent(event) {
        return Object.assign(super.parseEvent(event), {
          deals: Array.from(this.deals),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();

        // What this deals
        /** @type {Set<Record<Teriock.Parameters.Consequence.RollConsequenceKey>} */
        this.deals = new Set(["damage"]);

        // Properties
        const properties =
          /** @type {TeriockProperty[]} */ this.parent.effects.filter(
            (e) => e.type === "property",
          );
        this.props = new Set(
          Array.from(properties).map((p) => toCamelCase(p.name)),
        );

        // Damage
        for (const p of properties.filter((p) => p.active)) {
          if (p.system.damageType) {
            this.damage.types.add(p.system.damageType.toLowerCase());
          }
        }
        if (this.powerLevel === "magic") {
          this.damage.types.add("magic");
        }
        this.damage.base.addTypes(this.damage.types);

        // Tags
        this.warded = false;

        // Range
        this.range.description = "";
        this.range.melee =
          this.range.long.unit === "melee" || this.range.short.unit === "melee";
        this.range.ranged = this.range.long.unitType !== "zero";

        // Macros
        this.hookedMacros =
          /** @type {Teriock.Parameters.Equipment.HookedEquipmentMacros} */ {};
        for (const pseudoHook of Object.keys(propertyPseudoHooks)) {
          this.hookedMacros[pseudoHook] = [];
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Range
        if (
          this.range.long.unitType === "zero" ||
          (this.range.long.unitType === "finite" &&
            this.range.short.unitType === "finite")
        ) {
          this.range.short.unit = this.range.long.unit;
        }
        this.range.description = this.range.long.abbreviation;
        if (this.range.long.unitType !== "zero") {
          const shortDescription =
            this.range.short.unitType === "finite"
              ? this.range.short.formula
              : this.range.short.text;
          this.range.description =
            shortDescription + " / " + this.range.description;
        }

        // Fighting Style
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
        if (!this.damage.base.nonZero) {
          this.range.melee = false;
        }
      }
    }
  );
}
