import { TextField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability general part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @implements {AbilityGeneralPartInterface}
     * @mixin
     */
    class AbilityGeneralPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          basic: new fields.BooleanField({
            initial: false,
            label: "Basic",
          }),
          class: new fields.StringField({
            choices: TERIOCK.options.ability.class,
          }),
          consumable: new fields.BooleanField({
            initial: false,
            label: "Consumable",
          }),
          delivery: new fields.SchemaField({
            base: new fields.StringField({
              initial: "weapon",
              choices: TERIOCK.options.ability.delivery,
            }),
            parent: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryParent,
            }),
            package: new fields.StringField({
              initial: null,
              nullable: true,
              choices: TERIOCK.options.ability.deliveryPackage,
            }),
          }),
          effectTypes: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.effectTypes,
            }),
          ),
          elderSorcery: new fields.BooleanField({
            initial: false,
            label: "Elder Sorcery",
          }),
          elderSorceryIncant: new TextField({
            initial: "",
            label: "With Elder Sorcery...",
          }),
          elements: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.elements,
            }),
          ),
          endCondition: new TextField({
            initial: "",
            label: "End Condition",
          }),
          executionTime: new fields.StringField({ initial: "a1" }),
          expansion: new fields.StringField({
            initial: null,
            nullable: true,
          }),
          expansionRange: new fields.StringField({
            initial: null,
            nullable: true,
          }),
          expansionSaveAttribute: new fields.StringField({ initial: "mov" }),
          featSaveAttribute: new fields.StringField({
            initial: "mov",
            choices: TERIOCK.index.attributes,
          }),
          form: new fields.StringField({ initial: "normal" }),
          grantOnly: new fields.BooleanField({
            initial: false,
            label: "Granter Only",
          }),
          grantOnlyText: new TextField({
            initial: "",
            label: "Granter Only",
          }),
          heightened: new TextField({
            initial: "",
            label: "Heightened",
          }),
          improvement: new TextField({
            initial: "",
            label: "Improvement",
          }),
          interaction: new fields.StringField({
            initial: "attack",
            choices: TERIOCK.options.ability.interaction,
          }),
          invoked: new fields.BooleanField({
            initial: false,
            label: "Invoked",
          }),
          limitation: new TextField({
            initial: "",
            label: "Limitation",
          }),
          maneuver: new fields.StringField({
            initial: "active",
            choices: TERIOCK.options.ability.maneuver,
          }),
          overview: new fields.SchemaField({
            base: new TextField({
              initial: "",
              label: "Description",
            }),
            proficient: new TextField({
              initial: "",
              label: "If Proficient",
            }),
            fluent: new TextField({
              initial: "",
              label: "If Fluent",
            }),
          }),
          powerSources: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.powerSources,
            }),
          ),
          range: new fields.StringField({
            initial: null,
            nullable: true,
          }),
          requirements: new TextField({
            initial: "",
            label: "Requirements",
          }),
          results: new fields.SchemaField({
            hit: new TextField({
              initial: "",
              label: "On Hit",
            }),
            critHit: new TextField({
              initial: "",
              label: "On Critical Hit",
            }),
            miss: new TextField({
              initial: "",
              label: "On Miss",
            }),
            critMiss: new TextField({
              initial: "",
              label: "On Critical Miss",
            }),
            save: new TextField({
              initial: "",
              label: "On Success",
            }),
            critSave: new TextField({
              initial: "",
              label: "On Critical Success",
            }),
            fail: new TextField({
              initial: "",
              label: "On Fail",
            }),
            critFail: new TextField({
              initial: "",
              label: "On Critical Fail",
            }),
          }),
          ritual: new fields.BooleanField({
            initial: false,
            label: "Ritual",
          }),
          rotator: new fields.BooleanField({
            initial: false,
            label: "Rotator",
          }),
          skill: new fields.BooleanField({
            initial: false,
            label: "Skill",
          }),
          spell: new fields.BooleanField({
            initial: false,
            label: "Spell",
          }),
          standard: new fields.BooleanField({
            initial: false,
            label: "Standard",
          }),
          sustained: new fields.BooleanField({
            initial: false,
            label: "Sustained",
          }),
          sustaining: new fields.SetField(
            new fields.DocumentUUIDField({ type: "ActiveEffect" }),
          ),
          targets: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.options.ability.targets,
            }),
            {
              initial: ["creature"],
            },
          ),
          trigger: new TextField({
            initial: "",
            label: "Trigger",
          }),
          warded: new fields.BooleanField({
            initial: false,
            label: "Warded",
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        // Effect key migration
        if (data.effects?.includes("truth")) {
          data.effects = data.effects.map((effect) =>
            effect === "truth" ? "truthDetecting" : effect,
          );
        }
        if (data.effects?.includes("duelMod")) {
          data.effects = data.effects.map((effect) =>
            effect === "duelMod" ? "duelModifying" : effect,
          );
        }

        // Form migration
        if (foundry.utils.getProperty(data, "abilityType")) {
          foundry.utils.setProperty(
            data,
            "form",
            foundry.utils.getProperty(data, "abilityType"),
          );
        }

        // Effect types migration
        if (data.effects) {
          data.effectTypes = data.effects;
          delete data.effects;
        }

        super.migrateData(data);
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          form: this.form,
          [`form.${this.form}`]: 1,
          maneuver: this.maneuver,
          [`maneuver.${this.maneuver}`]: 1,
          interaction: this.interaction,
          [`interaction.${this.interaction}`]: 1,
          time: this.executionTime,
          [`time.${this.executionTime}`]: 1,
          warded: Number(this.warded),
          range: this.range,
          basic: Number(this.basic),
          standard: Number(this.standard),
          skill: Number(this.skill),
          spell: Number(this.spell),
          ritual: Number(this.ritual),
          rotator: Number(this.rotator),
          sustained: Number(this.sustained),
          invoked: Number(this.invoked),
          elderSorcery: Number(this.elderSorcery),
          es: Number(this.elderSorcery),
          grantOnly: Number(this.grantOnly),
        });
        // Add deliveries
        if (this.delivery.base) {
          data[`delivery.${this.delivery.base}`] = 1;
        }
        if (this.delivery.parent) {
          data[`delivery.${this.delivery.parent}`] = 1;
        }
        if (this.delivery.package) {
          data[`delivery.${this.delivery.package}`] = 1;
        }
        if (this.interaction === "feat") {
          data[`attr.${this.featSaveAttribute}`] = 1;
        }
        if (this.expansion) {
          Object.assign(data, {
            expansion: this.expansion,
            [`expansion.${this.expansion}`]: 1,
            [`expansion.attr.${this.expansionSaveAttribute}`]: 1,
            [`expansion.range`]: this.expansionRange,
          });
        }
        // Add class
        if (this.parent.parent?.type === "rank") {
          const rank = /** @type {TeriockRank} */ this.parent.parent;
          data[`class.${rank.system.className.slice(0, 3).toLowerCase()}`] = 1;
          data[`class.${rank.system.className}`] = 1;
        }
        // Add elements
        for (const element of this.elements) {
          data[`element.${element}`] = 1;
          data[`element.${element.slice(0, 3).toLowerCase()}`] = 1;
        }
        // Add effect types
        for (const effectType of this.effectTypes) {
          data[`effect.${effectType}`] = 1;
        }
        // Add targets
        for (const target of this.targets) {
          data[`target.${target}`] = 1;
        }
        // Add power sources
        for (const powerSource of this.powerSources) {
          data[`power.${powerSource}`] = 1;
        }
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce power sources
        for (const ps of this.powerSources) {
          if (
            Object.keys(TERIOCK.index.effectTypes).includes(ps) &&
            !this.effectTypes.has(ps)
          ) {
            this.effectTypes.add(ps);
          }
        }

        // Add granting text
        if (this.grantOnly) {
          this.grantOnlyText = `This ability can only be used with @UUID[${this.parent.parent.uuid}].`;
        } else {
          this.grantOnlyText = "";
        }
      }
    }
  );
};
