const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { mergeLevel } from "../../helpers/utils.mjs";
import { tradecraftOptions } from "../../helpers/constants/tradecraft-options.mjs";
import { resourceOptions } from "../../helpers/constants/resource-options.mjs";
import { powerOptions } from "../../helpers/constants/power-options.mjs";
import { rankOptions } from "../../helpers/constants/rank-options.mjs";

function attributeField() {
  return new fields.SchemaField({
    saveProficient: new fields.BooleanField({ initial: false }),
    saveFluent: new fields.BooleanField({ initial: false }),
    value: new fields.NumberField({ initial: -3 }),
  });
}

function tradecraftField() {
  return new fields.SchemaField({
    proficient: new fields.BooleanField({ initial: false }),
    extra: new fields.NumberField({ initial: 0 }),
    bonus: new fields.NumberField({ initial: 0 }),
  })
}
const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");
const tradecraftData = {};
for (const key of Object.keys(tradecrafts)) {
  tradecraftData[key] = tradecraftField();
}
const tradecraftsField = new fields.SchemaField(tradecraftData);

function hackField(max) {
  return new fields.SchemaField({
    min: new fields.NumberField({ initial: 0 }),
    max: new fields.NumberField({ initial: max }),
    value: new fields.NumberField({ initial: 0 }),
  })
}

function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    size: new fields.StringField({ initial: size }),
    gapless: new fields.BooleanField({ initial: gapless }),
  })
}

export class TeriockCharacterData extends TypeDataModel {
  static defineSchema() {
    return {
      lvl: new fields.NumberField({ initial: 1 }),
      size: new fields.NumberField({ initial: 3 }),
      attributes: new fields.SchemaField({
        int: attributeField(),
        mov: attributeField(),
        per: attributeField(),
        snk: attributeField(),
        str: attributeField(),
        unp: attributeField(),
      }),
      tradecrafts: tradecraftsField,
      hp: new fields.SchemaField({
        base: new fields.NumberField({ initial: 1 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 1 }),
        value: new fields.NumberField({ initial: 1 }),
        temp: new fields.NumberField({ initial: 0 }),
      }),
      mp: new fields.SchemaField({
        base: new fields.NumberField({ initial: 1 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 1 }),
        value: new fields.NumberField({ initial: 1 }),
        temp: new fields.NumberField({ initial: 0 }),
      }),
      wither: new fields.SchemaField({
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 100 }),
        value: new fields.NumberField({ initial: 20 }),
      }),
      presence: new fields.SchemaField({
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 1 }),
        value: new fields.NumberField({ initial: 1 }),
        extra: new fields.NumberField({ initial: 0 }),
      }),
      hacks: new fields.SchemaField({
        arm: hackField(2),
        leg: hackField(2),
        body: hackField(1),
        eye: hackField(1),
        ear: hackField(1),
        mouth: hackField(1),
        nose: hackField(1),
      }),
      speedAdjustments: new fields.SchemaField({
        walk: new fields.NumberField({ initial: 3 }),
        difficultTerrain: new fields.NumberField({ initial: 2 }),
        crawl: new fields.NumberField({ initial: 1 }),
        swim: new fields.NumberField({ initial: 1 }),
        climb: new fields.NumberField({ initial: 1 }),
        hidden: new fields.NumberField({ initial: 1 }),
        leapHorizontal: new fields.NumberField({ initial: 1 }),
        leapVertical: new fields.NumberField({ initial: 0 }),
        fly: new fields.NumberField({ initial: 0 }),
        dig: new fields.NumberField({ initial: 0 }),
        dive: new fields.NumberField({ initial: 0 }),
      }),
      damage: new fields.SchemaField({
        standard: new fields.StringField({ initial: "" }),
        hand: new fields.StringField({ initial: "1" }),
        foot: new fields.StringField({ initial: "1" }),
        mouth: new fields.StringField({ initial: "1" }),
        bucklerShield: new fields.StringField({ initial: "1" }),
        largeShield: new fields.StringField({ initial: "1" }),
        towerShield: new fields.StringField({ initial: "1" }),
      }),
      movementSpeed: new fields.NumberField({ initial: 30 }),
      carryingCapacity: new fields.SchemaField({
        light: new fields.NumberField({ initial: 65 }),
        heavy: new fields.NumberField({ initial: 130 }),
        max: new fields.NumberField({ initial: 195 }),
      }),
      sheet: new fields.SchemaField({
        activeTab: new fields.StringField({ initial: "abilities" }),
        menus: new fields.SchemaField({
          abilityFilters: new fields.BooleanField({ initial: false }),
          abilityOptions: new fields.BooleanField({ initial: false }),
          abilitySort: new fields.BooleanField({ initial: false }),
          equipmentFilters: new fields.BooleanField({ initial: false }),
          equipmentOptions: new fields.BooleanField({ initial: false }),
          equipmentSort: new fields.BooleanField({ initial: false }),
          fluencyOptions: new fields.BooleanField({ initial: false }),
          resourceOptions: new fields.BooleanField({ initial: false }),
          rankOptions: new fields.BooleanField({ initial: false }),
          powerOptions: new fields.BooleanField({ initial: false }),
          effectOptions: new fields.BooleanField({ initial: false }),
        }),
        abilityFilters: new fields.SchemaField({
          search: new fields.StringField({ initial: "" }),
          basic: new fields.BooleanField({ initial: false }),
          standard: new fields.BooleanField({ initial: false }),
          skill: new fields.BooleanField({ initial: false }),
          spell: new fields.BooleanField({ initial: false }),
          ritual: new fields.BooleanField({ initial: false }),
          rotator: new fields.BooleanField({ initial: false }),
          verbal: new fields.BooleanField({ initial: false }),
          somatic: new fields.BooleanField({ initial: false }),
          material: new fields.BooleanField({ initial: false }),
          invoked: new fields.BooleanField({ initial: false }),
          sustained: new fields.BooleanField({ initial: false }),
          broken: new fields.BooleanField({ initial: false }),
          hp: new fields.BooleanField({ initial: false }),
          mp: new fields.BooleanField({ initial: false }),
          heightened: new fields.BooleanField({ initial: false }),
          expansion: new fields.BooleanField({ initial: false }),
          maneuver: new fields.StringField({ initial: null, nullable: true }),
          interaction: new fields.StringField({ initial: null, nullable: true }),
          powerSource: new fields.StringField({ initial: null, nullable: true }),
          element: new fields.StringField({ initial: null, nullable: true }),
          effects: new fields.ArrayField(new fields.StringField()),
        }),
        equipmentFilters: new fields.SchemaField({
          search: new fields.StringField({ initial: "" }),
          equipped: new fields.BooleanField({ initial: false }),
          shattered: new fields.BooleanField({ initial: false }),
          consumable: new fields.BooleanField({ initial: false }),
          identified: new fields.BooleanField({ initial: false }),
          properties: new fields.StringField({ initial: "" }),
          materialProperties: new fields.StringField({ initial: "" }),
          magicalProperties: new fields.StringField({ initial: "" }),
          weaponFightingStyles: new fields.StringField({ initial: "" }),
          powerLevel: new fields.StringField({ initial: "" }),
        }),
        abilitySortOption: new fields.StringField({ initial: "name" }),
        abilitySortAscending: new fields.BooleanField({ initial: true }),
        equipmentSortOption: new fields.StringField({ initial: "name" }),
        equipmentSortAscending: new fields.BooleanField({ initial: true }),
        display: new fields.SchemaField({
          ability: displayField("small", true),
          tradecraft: displayField(),
          rank: displayField(),
          equipment: displayField("small", true),
          power: displayField(),
          resource: displayField(),
          condition: displayField(),
          effect: displayField(),
        }),
        notes: new fields.HTMLField({ initial: "Notes can be added here." }),
        dieBox: new fields.HTMLField({ initial: "" }),
        primaryBlocker: new fields.StringField({ initial: null, nullable: true }),
        primaryAttacker: new fields.StringField({ initial: null, nullable: true }),
      }),
      weight: new fields.StringField({ initial: "216 lb" }),
      wornAc: new fields.NumberField({ initial: 0 }),
      naturalAv: new fields.NumberField({ initial: 0 }),
      attackPenalty: new fields.NumberField({ initial: 0 }),
      sb: new fields.BooleanField({ initial: false }),
      piercing: new fields.StringField({ initial: "none" }),
      money: new fields.SchemaField({
        copper: new fields.NumberField({ initial: 0 }),
        silver: new fields.NumberField({ initial: 0 }),
        gold: new fields.NumberField({ initial: 0 }),
        entTearAmber: new fields.NumberField({ initial: 0 }),
        fireEyeRuby: new fields.NumberField({ initial: 0 }),
        pixiePlumAmethyst: new fields.NumberField({ initial: 0 }),
        snowDiamond: new fields.NumberField({ initial: 0 }),
        dragonEmerald: new fields.NumberField({ initial: 0 }),
        moonOpal: new fields.NumberField({ initial: 0 }),
        magusQuartz: new fields.NumberField({ initial: 0 }),
        heartstoneRuby: new fields.NumberField({ initial: 0 }),
        total: new fields.NumberField({ initial: 0 }),
      }),
      moneyWeight: new fields.NumberField({ initial: 0 }),
    }
  }
}