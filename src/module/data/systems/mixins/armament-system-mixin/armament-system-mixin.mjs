import { AttackSystemMixin } from "../_module.mjs";
import { ArmamentExecution } from "../../../../executions/child-executions/_module.mjs";
import { addTypesToFormula, formulaExists } from "../../../../helpers/formula.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { EvaluationField, IdentifierField, MultiChangeField } from "../../../fields/_module.mjs";
import { defenseField, rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import { initialText } from "../../../fields/helpers/initializers.mjs";
import { ArmamentSettingsModel, RangeModel } from "../../../models/_module.mjs";
import { migrateKey } from "../../../shared/migrations/source-migrations.mjs";

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
      static Execution = ArmamentExecution;

      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Armament"];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          armament: true,
          childEffectTypes: ["ability", "fluency", "property", "resource", "imbuement"],
          visibleTypes: ["ability", "fluency", "property", "resource", "imbuement"],
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
          av: defenseField(),
          bv: defenseField(),
          damage: new MultiChangeField({
            base: rollableFormulaField(),
            twoHanded: rollableFormulaField(),
            types: new fields.SetField(new IdentifierField()),
          }, { multiChangePaths: ["base", "twoHanded"] }),
          equipmentClasses: new fields.SetField(
            new fields.StringField({ choices: TERIOCK.reference.equipmentClasses }),
          ),
          fightingStyle: new fields.StringField({
            choices: TERIOCK.reference.weaponFightingStyles,
            initial: null,
            nullable: true,
          }),
          impacts: new fields.SetField(
            new fields.StringField({
              choices: objectMap(TERIOCK.config.impact, i => i.take, { localize: true, filter: c => !c?.hidden }),
            }),
            { initial: ["damage"] },
          ),
          notes: new fields.HTMLField({ initial: "" }),
          range: new MultiChangeField({
            long: new EvaluationField({ label: "Range", model: RangeModel }),
            melee: new fields.BooleanField({ initial: true }),
            ranged: new fields.BooleanField({ initial: false }),
            short: new EvaluationField({ model: RangeModel }),
          }, { multiChangePaths: ["long", "short"] }),
          settings: new fields.EmbeddedDataField(ArmamentSettingsModel),
          specialRules: initialText(),
          spellTurning: new fields.BooleanField(),
          vitals: new fields.BooleanField(),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        const evaluationMigrations = ["damage.base", "damage.twoHanded", "attackPenalty"];
        for (const e of evaluationMigrations) { migrateKey(source, `${e}.raw`, e); }
        return super.migrateData(source, options, state);
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.ArmamentExecutionOptions}
       */
      static parseEvent(event, source) {
        const settings = source?.system?.settings;
        const rollSecretly = settings?.getSetting("rollSecretly")
          ?? game.settings.get("teriock", "armament").rollSecretly;
        const rollTwoHanded = settings?.getSetting("rollTwoHanded")
          ?? game.settings.get("teriock", "armament").rollTwoHanded;
        const hasTwoHandedAttack = Boolean(source?.system?.hasTwoHandedAttack);
        return Object.assign(super.parseEvent(event, source), {
          crit: event.ctrlKey,
          secret: rollSecretly !== Boolean(event.shiftKey),
          twoHanded: hasTwoHandedAttack && (rollTwoHanded !== Boolean(event.altKey)),
        });
      }

      /**
       * Armament tags.
       * @returns {Teriock.Display.DisplayTag[]}
       */
      get _armamentTags() {
        return [...this._propertyTags, ...this._rangeTags];
      }

      /** @returns {Teriock.Panels.PanelBar} */
      get _attackBar() {
        return {
          icon: TERIOCK.display.icons.interaction.attack,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.attack"),
          wrappers: [
            this.piercing.label,
            ...this._damageWrappers,
            formulaExists(this.hitBonus)
              ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.hitBonus", { value: this.hitBonus })
              : "",
            this.attackPenalty
              ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.attackPenalty", { value: this.attackPenalty })
              : "",
          ],
        };
      }

      /** @returns {string[]} */
      get _damageWrappers() {
        return this.hasAttack
          ? [
            _loc("TERIOCK.SYSTEMS.Armament.PANELS.damage", {
              value: this.hasTwoHandedAttack ? `${this.damage.base} / ${this.damage.twoHanded}` : this.damage.base,
            }),
          ]
          : [];
      }

      /** @returns {Teriock.Panels.PanelBar} */
      get _defenseBar() {
        return {
          icon: TERIOCK.display.icons.interaction.block,
          label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.defense"),
          wrappers: [
            this.av.value ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.av", { value: this.av.value }) : "",
            this.bv.value ? this.summarizedBlock : "",
          ],
        };
      }

      /** @inheritDoc */
      get _displayButtons() {
        const buttons = super._displayButtons;
        if (!formulaExists(this.damage.base)) {
          buttons.push({
            button: "damage",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
            update: { "system.damage.base": "1" },
          });
        }
        if (!formulaExists(this._source.damage.twoHanded)) {
          buttons.push({
            button: "twoHandedDamage",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
            update: { "system.damage.twoHanded": "1" },
          });
        }
        if (!this.av.raw) {
          buttons.push({
            button: "av",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
            update: { "system.av.raw": "1" },
          });
        }
        if (!this.bv.raw) {
          buttons.push({
            button: "bv",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
            update: { "system.bv.raw": "1" },
          });
        }
        if (
          (formulaExists(this.damage.base) || formulaExists(this.damage.twoHanded)) && !formulaExists(this.hitBonus)
        ) {
          buttons.push({
            button: "hit",
            label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
            update: { "system.hitBonus": "1" },
          });
        }
        if (this.range.ranged && !formulaExists(this.range.long.raw)) {
          buttons.push({
            button: "range",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.long.raw.label",
            update: { "system.range.long.raw": "5" },
          });
        }
        if (this.range.ranged && !formulaExists(this.range.short.raw)) {
          buttons.push({
            button: "shortRange",
            label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.short.raw.label",
            update: { "system.range.short.raw": "5" },
          });
        }
        return buttons;
      }

      /** @inheritDoc */
      get _displayFields() {
        return [this._displayFieldInstructions, "system.notes", "system.description", {
          classes: TERIOCK.display.panel.classes.derived,
          editable: false,
          label: _loc("TERIOCK.SYSTEMS.Armament.FIELDS.fightingStyle.named", {
            name: TERIOCK.reference.weaponFightingStyles[this.fightingStyle],
          }),
          path: "system.specialRules",
        }];
      }

      /** @inheritDoc */
      get _displayInputs() {
        return [...super._displayInputs, ...this._displayInputsArmament];
      }

      /**
       * Armament display inputs.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayInputsArmament() {
        return ["system.fightingStyle"];
      }

      /** @inheritDoc */
      get _displayTags() {
        return [...super._displayTags, ...this._equipmentClassesTags, ...this._armamentTags];
      }

      /**
       * Equipment classes tags.
       * @returns {Teriock.Display.DisplayTag[]}
       */
      get _equipmentClassesTags() {
        return Array.from(this.equipmentClasses).map(t => {
          return {
            label: TERIOCK.reference.equipmentClasses[t],
            tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
          };
        });
      }

      /**
       * Property tags.
       * @returns {Teriock.Display.DisplayTag[]}
       */
      get _propertyTags() {
        const tags = [];
        if (this.spellTurning) {
          tags.push({ label: "TERIOCK.TERMS.Properties.spellTurning", tooltip: "TERIOCK.PACKS.properties" });
        }
        if (this.warded) { tags.push({
            label: "TERIOCK.TERMS.Properties.warded",
            tooltip: "TERIOCK.PACKS.properties",
          }); }
        return tags;
      }

      /**
       * Range tags.
       * @returns {Teriock.Display.DisplayTag[]}
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
      get embedParts() {
        const parts = super.embedParts;
        return Object.assign(parts, {
          text: dotJoin([...this._damageWrappers, ...this._defenseBar.wrappers, parts.text]),
        });
      }

      /**
       * Whether this has an attack.
       * @returns {boolean}
       */
      get hasAttack() {
        return formulaExists(this.damage.base) || formulaExists(this.damage.twoHanded);
      }

      /**
       * If this has a two-handed damage attack.
       * @returns {boolean}
       */
      get hasTwoHandedAttack() {
        return formulaExists(this.damage.twoHanded) && this.damage.twoHanded !== this.damage.base;
      }

      /**
       * The abilities that activate on use.
       * @returns {TeriockAbility[]}
       */
      get onUseAbilities() {
        return this.parent.abilities.filter(a => a.system.grantUse);
      }

      /**
       * Summary of attack stats.
       * @returns {string}
       */
      get summarizedAttack() {
        return dotJoin(this._attackBar.wrappers.filter(Boolean));
      }

      /**
       * Summary of block stats.
       * @returns {string}
       */
      get summarizedBlock() {
        return _loc("TERIOCK.SYSTEMS.Armament.PANELS.bv", { value: this.bv.value });
      }

      /** @inheritDoc */
      get useIcon() {
        return formulaExists(this.hasAttack) ? TERIOCK.display.icons.ui.damage : super.useIcon;
      }

      /**
       * @inheritDoc
       * @param {Teriock.Execution.ArmamentExecutionOptions} options
       */
      async _use(options = {}) {
        if (this.settings.getSetting("rollAttackOnUse")) {
          await this.actor?.useDocument("basic-attack", { type: "ability" });
        }
        options.impacts ??= this.impacts;
        await super._use(options);
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = [{
          group: "usage",
          icon: makeIcon(TERIOCK.display.icons.equipment.twoHanded, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.USAGE.twoHanded"),
          onClick: this.use.bind(this, { twoHanded: true }),
          visible: this.parent.isOwner && this.hasTwoHandedAttack,
        }];
        return [...entries, ...super.getCardContextMenuEntries(doc)];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          [`style.${this.fightingStyle}`]: 1,
          armament: 1,
          av: this.av.value,
          bv: this.bv.value,
          dmg: this.damage.base,
          "dmg.2h": this.damage.twoHanded,
          range: this.range.long.formula,
          "range.melee": Number(this.range.melee),
          "range.ranged": Number(this.range.ranged),
          "range.short": this.range.short.formula,
          spellTurning: Number(this.spellTurning),
          style: this.fightingStyle,
          vitals: Number(this.vitals),
        });
        for (const type of this.damage.types) { data[`dmg.type.${type}`] = 1; }
        for (const p of this.props || new Set()) { data[`prop.${p}`] = 1; }
        for (const impact of this.impacts) { data[`impact.${impact}`] = 1; }
        for (const equipmentClass of this.equipmentClasses) { data[`class.${equipmentClass}`] = 1; }
        return data;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();

        // Bring two-handed attacks up to parity with base
        if (!formulaExists(this.damage.twoHanded)) { this.damage.twoHanded = this.damage.base; }

        // Properties
        const properties = /** @type {TeriockProperty[]} */ this.parent.effects.filter(e => e.type === "property");
        this.props = new Set(Array.from(properties).map(p => toCamelCase(p.name)));

        // Propagate damage types
        for (const p of properties.filter(p => p.active)) {
          if (p.system.damageType) { this.damage.types.add(p.system._source.damageType); }
        }
        if (this.powerLevel === "magic") { this.damage.types.add("magic"); }
        this.damage.base = addTypesToFormula(this.damage.base, this.damage.types);
        this.damage.twoHanded = addTypesToFormula(this.damage.twoHanded, this.damage.types);

        // Range
        this.range.description = "";
        if (this.range.long.unitType === "zero") { this.range.melee = true; }
        this.range.ranged = this.range.long.unitType !== "zero";
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Range
        if (
          this.range.long.unitType === "zero"
          || (this.range.long.unitType === "finite" && this.range.short.unitType === "finite")
        ) {
          this.range.short.unit = this.range.long.unit;
        }

        // Fighting Style
        if (this.fightingStyle && this.fightingStyle.length > 0) {
          this.specialRules = TERIOCK.content.weaponFightingStyles[this.fightingStyle];
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();

        // Range
        if (!this.hasAttack) { this.range.melee = false; }
        this.range.description = this.range.long.abbreviation;
        if (this.range.long.unitType !== "zero") {
          const shortDescription = this.range.short.unitType === "finite"
            ? this.range.short.formula
            : this.range.short.text;
          this.range.description = `${shortDescription} / ${this.range.description}`;
        }
      }
    }
  );
}
