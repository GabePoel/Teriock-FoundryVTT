import { ArmamentExecution } from "../../../../executions/document-executions/_module.mjs";
import {
  addTypesToFormula,
  formulaExists,
} from "../../../../helpers/formula.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { makeIcon, objectMap } from "../../../../helpers/utils.mjs";
import {
  EvaluationField,
  FormulaField,
  IdentifierField,
  MultiChangeField,
  TextField,
} from "../../../fields/_module.mjs";
import { DefenseModel, RangeModel } from "../../../models/_module.mjs";
import { AttackSystemMixin } from "../_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function ArmamentSystemMixin(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.ArmamentSystemData}
     * @mixes AttackSystem
     * @mixin
     */
    class ArmamentSystem extends AttackSystemMixin(Base) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Armament",
      ];

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
          damage: new MultiChangeField(
            {
              base: new FormulaField({ deterministic: false }),
              twoHanded: new FormulaField({ deterministic: false }),
              types: new fields.SetField(new IdentifierField()),
            },
            {
              multiChangePaths: ["base", "twoHanded"],
            },
          ),
          equipmentClasses: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.reference.equipmentClasses,
            }),
          ),
          fightingStyle: new fields.StringField({
            initial: null,
            nullable: true,
            choices: TERIOCK.reference.weaponFightingStyles,
          }),
          impacts: new fields.SetField(
            new fields.StringField({
              choices: objectMap(TERIOCK.options.impact, (i) => i.take, {
                filter: (c) => !c?.hidden,
                localize: true,
              }),
            }),
            { initial: ["damage"] },
          ),
          notes: new TextField({ initial: "" }),
          range: new fields.SchemaField({
            long: new EvaluationField({ model: RangeModel, label: "Range" }),
            melee: new fields.BooleanField({ initial: true }),
            ranged: new fields.BooleanField({ initial: false }),
            short: new EvaluationField({ model: RangeModel }),
          }),
          specialRules: new TextField({ initial: "", persisted: false }),
          spellTurning: new fields.BooleanField({
            initial: false,
            nullable: false,
          }),
          vitals: new fields.BooleanField({ initial: false, nullable: false }),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        const evaluationMigrations = [
          "damage.base",
          "damage.twoHanded",
          "attackPenalty",
        ];
        for (const e of evaluationMigrations) {
          if (foundry.utils.hasProperty(data, `${e}.raw`)) {
            foundry.utils.setProperty(
              data,
              e,
              foundry.utils.getProperty(data, `${e}.raw`),
            );
          }
        }
        return super.migrateData(data);
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      static parseEvent(event) {
        return Object.assign(super.parseEvent(event), {
          crit: event.ctrlKey,
          twoHanded: game.teriock.getSetting("twoHandedArmaments")
            ? !event.altKey
            : event.altKey,
        });
      }

      /**
       * Armament tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _armamentTags() {
        return [...this._propertyTags, ...this._rangeTags];
      }

      /** @returns {Teriock.MessageData.MessageBar} */
      get _attackBar() {
        return {
          icon: TERIOCK.display.icons.interaction.attack,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.attack"),
          wrappers: [
            this.piercing.value,
            ...this._damageWrappers,
            formulaExists(this.hitBonus)
              ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.hitBonus", {
                  value: this.hitBonus,
                })
              : "",
            this.attackPenalty
              ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.attackPenalty", {
                  value: this.attackPenalty,
                })
              : "",
          ],
        };
      }

      /** @returns {string[]} */
      get _damageWrappers() {
        return this.hasAttack ? [this.summarizedAttack] : [];
      }

      /** @returns {Teriock.MessageData.MessageBar} */
      get _defenseBar() {
        return {
          icon: TERIOCK.display.icons.interaction.block,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.defense"),
          wrappers: [
            this.av.value
              ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.av", {
                  value: this.av.value,
                })
              : "",
            this.bv.value ? this.summarizedBlock : "",
          ],
        };
      }

      /**
       * Equipment classes tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _equipmentClassesTags() {
        return Array.from(this.equipmentClasses).map((t) => {
          return {
            label: TERIOCK.reference.equipmentClasses[t],
            tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
          };
        });
      }

      /**
       * Property tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _propertyTags() {
        const tags = [];
        if (this.spellTurning) {
          tags.push({
            label: "TERIOCK.TERMS.Properties.spellTurning",
            tooltip: "TERIOCK.PACKS.properties",
          });
        }
        if (this.warded) {
          tags.push({
            label: "TERIOCK.TERMS.Properties.warded",
            tooltip: "TERIOCK.PACKS.properties",
          });
        }
        return tags;
      }

      /**
       * Range tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _rangeTags() {
        const tags = [];
        if (this.range.melee && this.range.long.unitType !== "zero") {
          tags.push({
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.melee.label",
            tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.range.label",
          });
        }
        if (this.range.ranged) {
          tags.push({
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.ranged.label",
            tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.range.label",
          });
        }
        return tags;
      }

      /** @inheritDoc */
      get displayFields() {
        return [
          "system.description",
          "system.notes",
          "system.flaws",
          {
            classes: TERIOCK.display.panel.classes.derived,
            editable: false,
            label: _loc("TERIOCK.SYSTEMS.Armament.FIELDS.fightingStyle.named", {
              name: TERIOCK.reference.weaponFightingStyles[this.fightingStyle],
            }),
            path: "system.specialRules",
          },
        ];
      }

      /** @inheritDoc */
      get displayTags() {
        return [
          ...super.displayTags,
          ...this._equipmentClassesTags,
          ...this._armamentTags,
        ];
      }

      /** @inheritDoc */
      get embedParts() {
        const parts = super.embedParts;
        return Object.assign(parts, {
          text: dotJoin([
            ...this._damageWrappers,
            ...this._defenseBar.wrappers,
            parts.text,
          ]),
        });
      }

      /**
       * Whether this has an attack.
       * @returns {boolean}
       */
      get hasAttack() {
        return (
          formulaExists(this.damage.base) ||
          formulaExists(this.damage.twoHanded)
        );
      }

      /**
       * If this has a two-handed damage attack.
       * @returns {boolean}
       */
      get hasTwoHandedAttack() {
        return (
          formulaExists(this.damage.twoHanded) &&
          this.damage.twoHanded !== this.damage.base
        );
      }

      /**
       * Summary of attack stats.
       * @returns {string}
       */
      get summarizedAttack() {
        return _loc("TERIOCK.SYSTEMS.Armament.PANELS.damage", {
          value: this.hasTwoHandedAttack
            ? `${this.damage.base} / ${this.damage.twoHanded}`
            : this.damage.base,
        });
      }

      /**
       * Summary of block stats.
       * @returns {string}
       */
      get summarizedBlock() {
        return _loc("TERIOCK.SYSTEMS.Armament.PANELS.bv", {
          value: this.bv.formula,
        });
      }

      /** @inheritDoc */
      get useIcon() {
        return formulaExists(this.hasAttack)
          ? TERIOCK.display.icons.ui.damage
          : super.useIcon;
      }

      /**
       * @inheritDoc
       * @param {Teriock.Execution.ArmamentExecutionOptions} options
       */
      async _use(options = {}) {
        if (game.teriock.getSetting("rollAttackOnArmamentUse")) {
          await this.actor?.useDocument("basic-attack", { type: "ability" });
        }
        options.impacts ??= this.impacts;
        await new ArmamentExecution(options).execute();
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = [
          {
            name: _loc("TERIOCK.SYSTEMS.Equipment.USAGE.twoHanded"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.twoHanded,
              "contextMenu",
            ),
            callback: this.use.bind(this, { twoHanded: true }),
            condition: this.parent.isOwner && this.hasTwoHandedAttack,
            group: "usage",
          },
        ];
        return [...entries, ...super.getCardContextMenuEntries(doc)];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          armament: 1,
          dmg: this.damage.base,
          "dmg.2h": this.damage.twoHanded,
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
        for (const impact of this.impacts) {
          data[`impact.${impact}`] = 1;
        }
        for (const equipmentClass of this.equipmentClasses) {
          data[`class.${equipmentClass}`] = 1;
        }
        return data;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();

        // Bring two-handed attacks up to parity with base
        if (!formulaExists(this.damage.twoHanded)) {
          this.damage.twoHanded = this.damage.base;
        }

        // Properties
        const properties =
          /** @type {TeriockProperty[]} */ this.parent.effects.filter(
            (e) => e.type === "property",
          );
        this.props = new Set(
          Array.from(properties).map((p) => toCamelCase(p.name)),
        );

        // Propagate damage types
        for (const p of properties.filter((p) => p.active)) {
          if (p.system.damageType) {
            this.damage.types.add(p.system.damageType.toLowerCase());
          }
        }
        if (this.powerLevel === "magic") this.damage.types.add("magic");
        this.damage.base = addTypesToFormula(
          this.damage.base,
          this.damage.types,
        );
        this.damage.twoHanded = addTypesToFormula(
          this.damage.twoHanded,
          this.damage.types,
        );

        // Range
        this.range.description = "";
        if (this.range.long.unitType === "zero") this.range.melee = true;
        this.range.ranged = this.range.long.unitType !== "zero";
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
        if (!this.hasAttack) this.range.melee = false;
      }
    }
  );
}
