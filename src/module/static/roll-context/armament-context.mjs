import { preLocalizeObject } from "../../helpers/localization.mjs";
import { toKebabCase } from "../../utils/_module.mjs";
import usableContext from "./usable-context.mjs";

const armamentContext = {
  ...usableContext,
  armament: "TYPES.Item.armament",
  body: "TYPES.Item.body",
  equipment: "TYPES.Item.equipment",

  av: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
  bv: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
  dmg: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
  "dmg.2h": "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
  range: "TERIOCK.ROLL_CONTEXT.Armament.longRange",
  "range.long": "TERIOCK.ROLL_CONTEXT.Armament.longRange",
  "range.melee": "TERIOCK.SYSTEMS.Armament.FIELDS.range.melee.label",
  "range.ranged": "TERIOCK.SYSTEMS.Armament.FIELDS.range.ranged.label",
  "range.short": "TERIOCK.SYSTEMS.Armament.FIELDS.range.short.raw.label",
  "spell-turning": "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
  vitals: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label",

  attuned: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned",
  consumable: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumption.enabled.label",
  dampened: "TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label",
  destroyed: "TERIOCK.SYSTEMS.Equipment.FIELDS.destroyed.label",
  equipped: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
  glued: "TERIOCK.SYSTEMS.Equipment.FIELDS.glued.label",
  identified: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.identified.label",
  max: "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.maxFormula.label",
  "str.min": "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.label",
  price: "TERIOCK.SYSTEMS.Equipment.FIELDS.price.label",
  quantity: "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.value.label",
  "quantity.max": "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.maxFormula.label",
  read: "TERIOCK.ROLL_CONTEXT.Armament.read",
  shattered: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
  stashed: "TERIOCK.SYSTEMS.Equipment.FIELDS.stashed.label",

  storage: "TERIOCK.ROLL_CONTEXT.Armament.storage",
  "storage.count": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.count.value.label",
  "storage.count.max": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.count.max.label",
  "storage.count.over": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.count.max.over",
  "storage.weight": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.weight.value.label",
  "storage.weight.max": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.weight.max.label",
  "storage.weight.mult": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.weight.multiplier.label",
  "storage.weight.over": "TERIOCK.SYSTEMS.Equipment.FIELDS.storage.weight.max.over",
  tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
  weight: "TERIOCK.SYSTEMS.Equipment.FIELDS.weight.label",
};

export default armamentContext;

preLocalizeObject("ROLL_CONTEXT.armament");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(game.teriock.identifiers.getNames("style", { permission: "LIMITED" })).forEach(([k, name]) => {
    armamentContext[`style.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.style", { name });
  });
  Object.entries(game.teriock.identifiers.getNames("damage", { permission: "LIMITED" })).forEach(([k, name]) => {
    armamentContext[`dmg.type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.damageType", { name });
  });
  Object.entries(game.teriock.identifiers.getNames("property", { permission: "LIMITED" })).forEach(([k, name]) => {
    armamentContext[`prop.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.property", { name });
  });
  Object.entries(TERIOCK.CONFIG.command).filter(([_k, v]) => v.numeric).forEach(([k, v]) => {
    armamentContext[`command.${toKebabCase(k)}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.command", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.equipment.equipmentClasses).forEach(([k, v]) => {
    armamentContext[`class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.class", { name: v.label });
  });
  Object.entries(game.teriock.identifiers.getNames("equipment", { permission: "LIMITED" })).forEach(([k, name]) => {
    armamentContext[`type.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.type", { name });
  });
  Object.entries({ ...TERIOCK.CONFIG.equipment.kind, intrinsic: TERIOCK.CONFIG.effect.kind.intrinsic }).forEach(
    ([k, v]) => {
      armamentContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Armament.kind", { name: v.label });
    },
  );
});
