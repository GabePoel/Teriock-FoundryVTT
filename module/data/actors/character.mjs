const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { mergeLevel } from "../../helpers/utils.mjs";
import { tradecraftOptions } from "../../helpers/constants/tradecraft-options.mjs";
import { attributeField, tradecraftField, hackField, sheetField } from "./actor-fields.mjs";
import { migrate } from "./migrate.mjs";

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");
const tradecraftData = {};
for (const key of Object.keys(tradecrafts)) {
  tradecraftData[key] = tradecraftField();
}
const tradecraftsField = new fields.SchemaField(tradecraftData);

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
      sheet: sheetField(),
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

  static migrateData(data) {
    // data = migrate(data);
    return super.migrateData(data);
  }
}