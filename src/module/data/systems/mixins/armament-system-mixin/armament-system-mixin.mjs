import { AttackSystemMixin } from "../_module.mjs";
import { listFormat, secondaryFormat } from "../../../../helpers/localization.mjs";
import { dotJoin, getName, makeIcon, mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import { FormulaField, MultiChangeField, SlugField, UnitField } from "../../../fields/_module.mjs";
import { defenseField, rollableFormulaField, slugSetField } from "../../../fields/tools/builders.mjs";
import { initialText } from "../../../fields/tools/initializers.mjs";
import { ArmamentRangeUnitModel, documentSettingsModels } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ArmamentSystemMixin(Base) {
  /**
   * @mixes AttackSystem
   * @mixin
   * @implements {Teriock.Models.ArmamentSystemData}
   */
  class ArmamentSystem
    extends mixClasses(
      /** @type {InitializedDataModel<T, Teriock.Models.ArmamentSystemData>} */ (Base),
      AttackSystemMixin,
    )
  {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Armament"];

    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      automationTags: { triggered: true },
      childTypes: ["ability", "fluency", "property", "resource", "imbuement"],
      tags: { armament: true },
    });

    /** @inheritDoc */
    static get Execution() {
      return teriock.executions.child.ArmamentExecution;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        av: defenseField(),
        bv: defenseField(),
        commands: new fields.SetField(
          new fields.StringField({
            choices: objectMap(TERIOCK.CONFIG.command, i => i.numeric?.take, {
              localize: true,
              filter: c => c.numeric,
            }),
          }),
          { initial: () => ["damage"] },
        ),
        damage: new MultiChangeField({
          base: rollableFormulaField({ placeholder: _loc("COMMON.None") }),
          twoHanded: rollableFormulaField({ placeholder: _loc("COMMON.None") }),
          types: new fields.SetField(new SlugField()),
        }, { multiChangePaths: ["base", "twoHanded"] }),
        equipmentClasses: slugSetField(TERIOCK.CONFIG.equipment.equipmentClasses),
        range: new MultiChangeField({
          long: new UnitField(ArmamentRangeUnitModel),
          reach: new UnitField(ArmamentRangeUnitModel, { initial: () => ({ unit: "ft" }) }),
          short: new UnitField(ArmamentRangeUnitModel),
        }, { multiChangePaths: ["long", "short"] }),
        settings: new fields.EmbeddedDataField(documentSettingsModels.armament),
        spellTurning: new fields.BooleanField(),
        style: new SlugField({
          initial: null,
          nullable: true,
          placeholder: _loc("COMMON.None"),
          types: ["style"],
          validateChoices: false,
          choices: () =>
            teriock.helpers.localization.choicesWithNone(
              game.teriock.identifiers.getNames("style", { permission: "LIMITED" }),
            ),
        }),
        styleDescription: initialText(),
        vitals: new fields.BooleanField(),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      const range = source.range;
      if (range && !("reach" in range) && (range.melee === false || range.long?.unit === "self")) {
        range.reach = { unit: "none" };
      }
      if (range) {
        delete range.melee;
        delete range.ranged;
      }
      return super.migrateData(source, options);
    }

    /** @inheritDoc */
    static parseEvent(event, source) {
      const parsed = super.parseEvent(event, source);
      const settings = source?.system?.settings;
      const rollSecretly = settings?.getSetting("rollSecretly")
        ?? game.settings.get("teriock", "armament").rollSecretly;
      const rollTwoHanded = settings?.getSetting("rollTwoHanded")
        ?? game.settings.get("teriock", "armament").rollTwoHanded;
      const hasTwoHandedAttack = Boolean(source?.system?.hasTwoHandedAttack);
      Object.assign(parsed.data, {
        crit: event.ctrlKey,
        secret: rollSecretly !== Boolean(event.shiftKey),
        twoHanded: hasTwoHandedAttack && (rollTwoHanded !== Boolean(event.altKey)),
      });
      return parsed;
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
        icon: TERIOCK.DISPLAY.icons.manifest.interaction.attack,
        label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.attack"),
        wrappers: [
          this.piercing.label,
          this.damageTag,
          FormulaField.exists(this.hitBonus)
            ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.hitBonus", { value: this.hitBonus })
            : "",
          this.attackPenalty
            ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.attackPenalty", { value: this.attackPenalty })
            : "",
        ],
      };
    }

    /** @returns {Teriock.Panels.PanelBar} */
    get _defenseBar() {
      return {
        icon: TERIOCK.DISPLAY.icons.manifest.interaction.block,
        label: _loc("TERIOCK.SYSTEMS.Armament.PANELS.defense"),
        wrappers: [
          this.av.value ? _loc("TERIOCK.SYSTEMS.Armament.PANELS.av", { value: this.av.value }) : "",
          this.bv.value ? this.summarizedBlock : "",
        ],
      };
    }

    /** @inheritDoc */
    get _displayAddOptions() {
      const options = super._displayAddOptions;
      if (!this.damage.base) {
        options.push({
          group: "combat",
          id: "damage",
          label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
          subgroup: "offense",
          update: { "system.damage.base": "1" },
        });
      }
      if (!this.av.raw) {
        options.push({
          group: "combat",
          id: "av",
          label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
          subgroup: "defense",
          update: { "system.av.raw": "1" },
        });
      }
      if (!this.bv.raw) {
        options.push({
          group: "combat",
          id: "bv",
          label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
          subgroup: "defense",
          update: { "system.bv.raw": "1" },
        });
      }
      if (!FormulaField.exists(this.hitBonus)) {
        options.push({
          group: "combat",
          id: "hit",
          label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
          subgroup: "offense",
          update: { "system.hitBonus": "1" },
        });
      }
      return options;
    }

    /** @inheritDoc */
    get _displayFieldsContent() {
      return [...super._displayFieldsContent, {
        classes: [TERIOCK.DISPLAY.panels.styles.derived],
        editable: false,
        label: _loc("TERIOCK.SYSTEMS.Armament.FIELDS.style.named", { name: getName(`style:${this.style}`) }),
        path: "system.styleDescription",
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
      return [{ group: "combat", path: "system.style" }];
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
          label: TERIOCK.CONFIG.equipment.equipmentClasses[t]?.label,
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
      if (this.warded) { tags.push({ label: "TERIOCK.TERMS.Properties.warded", tooltip: "TERIOCK.PACKS.properties" }); }
      return tags;
    }

    /**
     * Range tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _rangeTags() {
      return [this.meleeTag, this.rangedTag].filter(Boolean).map(label => {
        return { label, tooltip: "TERIOCK.SYSTEMS.Armament.FIELDS.range.label" };
      });
    }

    /**
     * Formatted damage.
     * @returns {string}
     */
    get damageTag() {
      if (!this.hasAttack) { return ""; }
      const value = secondaryFormat(this.damage.base, this.damage.twoHanded, { secondFilter: FormulaField.exists });
      const types = ["damage", "drain"].filter(c => this.commands.has(c)).map(c =>
        _loc(`TERIOCK.SYSTEMS.Armament.PANELS.${c}`)
      );
      return [value, listFormat(types, { style: "short" })].filterJoin(" ");
    }

    /** @inheritDoc */
    get embedParts() {
      const parts = super.embedParts;
      return Object.assign(parts, { text: dotJoin([this.damageTag, ...this._defenseBar.wrappers, parts.text]) });
    }

    /**
     * Whether this has an attack.
     * @returns {boolean}
     */
    get hasAttack() {
      return FormulaField.exists(this.damage.base) || FormulaField.exists(this.damage.twoHanded);
    }

    /**
     * If this has a two-handed damage attack.
     * @returns {boolean}
     */
    get hasTwoHandedAttack() {
      return FormulaField.exists(this.damage.twoHanded) && (this.damage.twoHanded !== this.damage.base);
    }

    /**
     * Whether this can make melee attacks.
     * @returns {boolean}
     */
    get isMelee() {
      return this.range.reach.unitType !== "zero";
    }

    /** @inheritDoc */
    get isPassive() {
      return false;
    }

    /**
     * Whether this can make ranged attacks.
     * @returns {boolean}
     */
    get isRanged() {
      return this.range.long.unitType !== "zero";
    }

    /**
     * @inheritDoc
     * @returns {Teriock.Mechanics.MechanicToggleEntry[]}
     */
    get mechanicToggles() {
      return [...this._mechanicTogglesHit, ...super.mechanicToggles];
    }

    /**
     * Formatted melee reach.
     * @returns {string}
     */
    get meleeTag() {
      if (!this.isMelee) { return ""; }
      const reach = this.range.reach;
      return [
        _loc("TERIOCK.SYSTEMS.Armament.PANELS.melee"),
        reach.unitType === "finite" && FormulaField.exists(reach.raw)
          ? _loc("TERIOCK.MODELS.BaseUnit.FORMAT", {
            number: Number.isNumeric(reach.raw) ? Number(reach.raw).signedString() : reach.raw,
            unit: _loc(reach.symbol),
          })
          : "",
      ].filterJoin(" ");
    }

    /**
     * The abilities that activate on use.
     * @returns {TeriockActiveEffect<"ability">[]}
     */
    get onUseAbilities() {
      return this.parent.previewedTypes.ability.filter(a => a.system.grantUse);
    }

    /**
     * Formatted ranged range.
     * @returns {string}
     */
    get rangedTag() {
      if (!this.isRanged) { return ""; }
      return [_loc("TERIOCK.SYSTEMS.Armament.PANELS.ranged"), this.rangeTag].filterJoin(" ");
    }

    /**
     * Formatted range.
     * @returns {string}
     */
    get rangeTag() {
      const long = this.range.long;
      if (long.unitType === "zero") { return ""; }
      if (long.unitType === "infinite") { return long.label; }
      if (!FormulaField.exists(long.raw)) { return ""; }
      return _loc("TERIOCK.MODELS.BaseUnit.FORMAT", {
        number: secondaryFormat(long.raw, this.range.short.raw, { reverse: true, secondFilter: FormulaField.exists }),
        unit: _loc(long.symbol),
      });
    }

    /**
     * Summary of attack stats.
     * @returns {string}
     */
    get summarizedAttack() {
      return dotJoin(this._attackBar.wrappers);
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
      return this.hasAttack ? TERIOCK.DISPLAY.icons.manifest.ui.damage : super.useIcon;
    }

    /**
     * @inheritDoc
     * @param {object} [data]
     * @param {Teriock.Execution.ArmamentExecutionOptions} [options]
     */
    async _use(data = {}, options = {}) {
      if (this.settings.getSetting("rollAttackOnUse")) {
        await this.actor?.useDocument("ability:basic-attack");
      }
      data.commands ??= this.commands;
      await super._use(data, options);
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const entries = [{
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.twoHanded, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.USAGE.twoHanded"),
        onClick: this.use.bind(this, { twoHanded: true }),
        visible: this.parent.isOwner && this.hasTwoHandedAttack,
      }];
      return [...entries, ...super.getEmbedContextMenuEntries(doc)];
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      Object.assign(data, {
        armament: 1,
        av: this.av.value,
        bv: this.bv.value,
        dmg: this.damage.base || 0,
        "dmg.2h": this.damage.twoHanded || 0,
        melee: Number(this.isMelee),
        range: this.range.long.rollValue,
        "range.long": this.range.long.rollValue,
        "range.reach": this.range.reach.rollValue,
        "range.short": this.range.short.rollValue,
        ranged: Number(this.isRanged),
        "spell-turning": Number(this.spellTurning),
        vitals: Number(this.vitals),
      });
      if (this.style) { data[`style.${this.style}`] = 1; }
      for (const type of this.damage.types) { data[`dmg.type.${type}`] = 1; }
      for (const p of this.parent.previewedTypes.property.filter(p => p.active)) {
        data[`property.${p.system.slug}`] = 1;
      }
      for (const command of this.commands) { data[`command.${TERIOCK.CONFIG.command[command].slug}`] = 1; }
      for (const equipmentClass of this.equipmentClasses) { data[`classification.${equipmentClass}`] = 1; }
      return data;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();

      // Bring two-handed attacks up to parity with base
      if (!FormulaField.exists(this.damage.twoHanded)) { this.damage.twoHanded = this.damage.base; }

      // Properties
      const properties = /** @type {TeriockActiveEffect<"property">[]} */ this.parent.effects.filter(e =>
        e.type === "property"
      );

      // Propagate damage types
      for (const p of properties.filter(p => p.active)) {
        if (p.system.damageType) { this.damage.types.add(p.system.damageType); }
      }
      if (this.kind === "magic") { this.damage.types.add("magic"); }
      this.damage.base = FormulaField.addTypes(this.damage.base, this.damage.types);
      this.damage.twoHanded = FormulaField.addTypes(this.damage.twoHanded, this.damage.types);
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();

      // Range
      this.range.short.unit = this.range.long.unit;

      // Fighting Style
      if (this.style) { this.styleDescription = `<p>@Embed[style:${this.style} description inline]</p>`; }
    }
  }

  return ArmamentSystem;
}
