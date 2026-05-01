import { preLocalize } from "../../helpers/localization.mjs";
import { equipmentConfig } from "../config/equipment-config.mjs";
import { impactConfig } from "../config/impact-config.mjs";
import usableContext from "./usable-context.mjs";

const armamentContext = {
  ...usableContext,
  armament: "TYPES.Item.armament",
  body: "TYPES.Item.body",
  equipment: "TYPES.Item.equipment",

  "dmg.2h": "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
  "range.melee": "TERIOCK.SYSTEMS.Armament.FIELDS.range.melee.label",
  "range.ranged": "TERIOCK.SYSTEMS.Armament.FIELDS.range.ranged.label",
  "range.short": "TERIOCK.SYSTEMS.Armament.FIELDS.range.short.raw.label",
  av: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
  bv: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
  dmg: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
  range: "TERIOCK.SYSTEMS.Armament.FIELDS.range.long.raw.label",
  spellTurning: "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
  style: "TERIOCK.SYSTEMS.Equipment.FIELDS.fightingStyle.label",
  vitals: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label",

  dampened: "TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label",
  destroyed: "TERIOCK.SYSTEMS.Equipment.FIELDS.destroyed.label",
  equipped: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
  glued: "TERIOCK.SYSTEMS.Equipment.FIELDS.glued.label",
  identified: "TERIOCK.MODELS.Identification.FIELDS.identified.label",
  minStr: "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.label",
  price: "TERIOCK.SYSTEMS.Equipment.FIELDS.price.label",
  read: "TERIOCK.MODELS.Identification.FIELDS.read.label",
  shattered: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
  stashed: "TERIOCK.SYSTEMS.Equipment.FIELDS.stashed.label",
  str: "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.label",

  "storage.count": "TERIOCK.MODELS.Storage.FIELDS.count.label",
  "storage.count.max": "TERIOCK.MODELS.Storage.FIELDS.maxCount.label",
  "storage.count.over": "TERIOCK.MODELS.Storage.FIELDS.maxCount.over",
  "storage.weight": "TERIOCK.MODELS.Storage.FIELDS.weight.label",
  "storage.weight.max": "TERIOCK.MODELS.Storage.FIELDS.maxWeight.label",
  "storage.weight.mult": "TERIOCK.MODELS.Storage.FIELDS.weightMultiplier.label",
  "storage.weight.over": "TERIOCK.MODELS.Storage.FIELDS.maxWeight.over",
  storage: "TERIOCK.MODELS.Storage.FIELDS.enabled.label",
  weight: "TERIOCK.SYSTEMS.Equipment.FIELDS.weight.label",
};

export default armamentContext;

preLocalize("rollContext.armament");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.weaponFightingStyles).forEach(([k, v]) => {
    armamentContext[`style.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.style",
      { name: _loc(v) },
    );
  });
  Object.entries(TERIOCK.reference.damageTypes).forEach(([k, v]) => {
    armamentContext[`dmg.type.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.damageType",
      { name: _loc(v) },
    );
  });
  Object.entries(TERIOCK.reference.properties).forEach(([k, v]) => {
    armamentContext[`prop.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.property",
      { name: _loc(v) },
    );
  });
  Object.entries(impactConfig).forEach(([k, v]) => {
    armamentContext[`impact.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.impact",
      { name: _loc(v.label) },
    );
  });
  Object.entries(TERIOCK.reference.equipmentClasses).forEach(([k, v]) => {
    armamentContext[`class.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.class",
      { name: _loc(v) },
    );
  });
  Object.entries(TERIOCK.reference.equipment).forEach(([k, v]) => {
    armamentContext[`type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.type", {
      name: _loc(v),
    });
  });
  Object.keys(equipmentConfig.powerLevel).forEach((k) => {
    armamentContext[`power.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Armament.power",
      { name: _loc(equipmentConfig.powerLevel[k].label) },
    );
  });
});
