const { fields } = foundry.data;
import { _messageParts } from "./_message-parts.mjs";
import { _parse } from "./_parsing.mjs";
import { _roll } from "./_rolling.mjs";
import { appliesField } from "./ability-fields.mjs";
import { migrate } from "./migrate.mjs";
import { MixinWikiData } from "../../mixins/wiki.mjs";
import { TeriockEffectData } from "../base/base.mjs";

export class TeriockAbilityData extends MixinWikiData(TeriockEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: 'Ability' }),
      parentId: new fields.DocumentIdField({
        initial: null,
        nullable: true,
      }),
      childIds: new fields.ArrayField(new fields.DocumentIdField()),
      elderSorcery: new fields.BooleanField({ initial: false }),
      elderSorceryIncant: new fields.HTMLField({ initial: "" }),
      powerSources: new fields.ArrayField(new fields.StringField()),
      interaction: new fields.StringField({ initial: "attack" }),
      featSaveAttribute: new fields.StringField({ initial: "mov" }),
      maneuver: new fields.StringField({ initial: "active" }),
      executionTime: new fields.StringField({ initial: "1a" }),
      delivery: new fields.SchemaField({
        base: new fields.StringField({ initial: "weapon" }),
        parent: new fields.StringField({ initial: null, nullable: true }),
        package: new fields.StringField({ initial: null, nullable: true }),
      }),
      targets: new fields.ArrayField(new fields.StringField()),
      elements: new fields.ArrayField(new fields.StringField()),
      duration: new fields.ArrayField(new fields.StringField()),
      sustained: new fields.BooleanField({ initial: false }),
      range: new fields.NumberField({ initial: null, nullable: true }),
      overview: new fields.SchemaField({
        base: new fields.HTMLField({ initial: "" }),
        proficient: new fields.HTMLField({ initial: "" }),
        fluent: new fields.HTMLField({ initial: "" }),
      }),
      results: new fields.SchemaField({
        hit: new fields.HTMLField({ initial: "" }),
        critHit: new fields.HTMLField({ initial: "" }),
        miss: new fields.HTMLField({ initial: "" }),
        critMiss: new fields.HTMLField({ initial: "" }),
        save: new fields.HTMLField({ initial: "" }),
        critSave: new fields.HTMLField({ initial: "" }),
        fail: new fields.HTMLField({ initial: "" }),
        critFail: new fields.HTMLField({ initial: "" }),
      }),
      piercing: new fields.StringField({ initial: "normal" }),
      improvements: new fields.SchemaField({
        attributeImprovement: new fields.SchemaField({
          attribute: new fields.StringField({ initial: null, nullable: true }),
          minVal: new fields.NumberField({ initial: 0 }),
        }),
        featSaveImprovement: new fields.SchemaField({
          attribute: new fields.StringField({ initial: null, nullable: true }),
          amount: new fields.StringField({ initial: "proficient" }),
        }),
      }),
      skill: new fields.BooleanField({ initial: false }),
      spell: new fields.BooleanField({ initial: false }),
      standard: new fields.BooleanField({ initial: false }),
      ritual: new fields.BooleanField({ initial: false }),
      class: new fields.StringField({ initial: "" }),
      rotator: new fields.BooleanField({ initial: false }),
      invoked: new fields.BooleanField({ initial: false }),
      costs: new fields.SchemaField({
        verbal: new fields.BooleanField({ initial: false }),
        somatic: new fields.BooleanField({ initial: false }),
        material: new fields.BooleanField({ initial: false }),
        mp: new fields.AnyField({ initial: null, nullable: true }),
        hp: new fields.AnyField({ initial: null, nullable: true }),
        break: new fields.StringField({ initial: "" }),
        manaCost: new fields.HTMLField({ initial: "" }),
        hitCost: new fields.HTMLField({ initial: "" }),
        materialCost: new fields.HTMLField({ initial: "" }),
      }),
      heightened: new fields.HTMLField({ initial: "" }),
      endCondition: new fields.HTMLField({ initial: "" }),
      requirements: new fields.HTMLField({ initial: "" }),
      effects: new fields.ArrayField(new fields.StringField()),
      expansion: new fields.StringField({ initial: null, nullable: true }),
      expansionRange: new fields.StringField({ initial: null, nullable: true }),
      expansionSaveAttribute: new fields.StringField({ initial: "mov" }),
      trigger: new fields.HTMLField({ initial: "" }),
      basic: new fields.BooleanField({ initial: false }),
      abilityType: new fields.StringField({ initial: "normal" }),
      limitation: new fields.HTMLField({ initial: "" }),
      improvement: new fields.HTMLField({ initial: "" }),
      applies: new fields.SchemaField({
        base: appliesField(),
        proficient: appliesField(),
        fluent: appliesField(),
      }),
    }
  }

  static migrateData(data) {
    return migrate(data);
  }

  /** @override */
  async roll(options) {
    return await _roll(this.parent, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  /** @override */
  get wikiPage() {
    return `Ability:${this.parent.name}`;
  }

  /** @override */
  async parse(rawHTML) {
    return await _parse(this.parent, rawHTML);
  }
}