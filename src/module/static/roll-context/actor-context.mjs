import { preLocalizeObject } from "../../helpers/localization.mjs";

const actorContext = {
  br: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.br.label",
  c: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.c.label",
  f: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.f.label",
  lvl: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.lvl.label",
  p: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.p.label",

  hp: "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.value.label",
  "hp.dice": "TERIOCK.ROLL_CONTEXT.StatDice.hpRemaining",
  "hp.dice.largest": "TERIOCK.ROLL_CONTEXT.StatDice.hpLargest",
  "hp.dice.max": "TERIOCK.ROLL_CONTEXT.StatDice.hpMax",
  "hp.dice.smallest": "TERIOCK.ROLL_CONTEXT.StatDice.hpSmallest",
  "hp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.max.label",
  "hp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.min.label",
  "hp.morganti": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.morganti.label",
  "hp.temp": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.temp.label",

  mp: "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.value.label",
  "mp.dice": "TERIOCK.ROLL_CONTEXT.StatDice.mpRemaining",
  "mp.dice.largest": "TERIOCK.ROLL_CONTEXT.StatDice.mpLargest",
  "mp.dice.max": "TERIOCK.ROLL_CONTEXT.StatDice.mpMax",
  "mp.dice.smallest": "TERIOCK.ROLL_CONTEXT.StatDice.mpSmallest",
  "mp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.max.label",
  "mp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.min.label",
  "mp.morganti": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.morganti.label",
  "mp.temp": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.temp.label",

  lp: "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.value.label",
  "lp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.max.label",
  "lp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.min.label",

  pres: "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.max.label",
  "pres.unused": "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.unused.label",
  "pres.used": "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.used.label",

  size: "TERIOCK.SHEETS.Actor.TABS.Details.size.label",
  "size.reach": "TERIOCK.ROLL_CONTEXT.Actor.reach",
  speed: "TERIOCK.SYSTEMS.BaseActor.FIELDS.speed.label",
  weight: "TERIOCK.SYSTEMS.BaseActor.FIELDS.weight.label",

  carry: "TERIOCK.ROLL_CONTEXT.Actor.carried",
  "carry.factor": "TERIOCK.SHEETS.Actor.TABS.Inventory.carrying.factor",
  "carry.heavy": "TERIOCK.SHEETS.Actor.TABS.Inventory.carrying.heavyCapacity",
  "carry.heavy.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
  "carry.light": "TERIOCK.SHEETS.Actor.TABS.Inventory.carrying.lightCapacity",
  "carry.light.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1",
  "carry.max": "TERIOCK.SHEETS.Actor.TABS.Inventory.carrying.maxCapacity",
  "carry.max.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3",

  ac: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.ac.label",
  ap: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
  av: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.value.label",
  "av.base": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.base.label",
  "av.nat": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.nat.label",
  "av.worn": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.worn.label",
  av0: "TERIOCK.TERMS.Properties.armorVoiding",
  bv: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.bv.label",
  cc: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.cc.label",
  h: "TERIOCK.ROLL_CONTEXT.Execution.h",
  hit: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
  m: "TERIOCK.ROLL_CONTEXT.Execution.m",
  sb: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label",
  ub: "TERIOCK.TERMS.Properties.unblockable",
  warded: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",

  "bag.pull": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.pull.label",
  "bag.stones": "TERIOCK.ROLL_CONTEXT.Actor.stones",

  curses: "TERIOCK.ROLL_CONTEXT.Actor.curses",
  "curses.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.curses.max.label",
  rotators: "TERIOCK.ROLL_CONTEXT.Actor.rotators",
  "rotators.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.rotators.max.label",

  "detection.hiding": "TERIOCK.SYSTEMS.BaseActor.FIELDS.detection.hiding.label",
  "detection.perceiving": "TERIOCK.SYSTEMS.BaseActor.FIELDS.detection.perceiving.label",

  money: "TERIOCK.SYSTEMS.BaseActor.FIELDS.money.total.label",
  "money.currency": "TERIOCK.SYSTEMS.BaseActor.FIELDS.money.physical.label",
  "money.debt": "TERIOCK.SYSTEMS.BaseActor.FIELDS.money.debt.label",
};

export default actorContext;

preLocalizeObject("ROLL_CONTEXT.actor");

Hooks.once("teriock.identifiersInit", () => {
  Object.keys(CONFIG.Actor.dataModels).forEach((k) => {
    actorContext[`type.${k}`] = _loc(`TYPES.Actor.${k}`);
  });
  Object.keys(TERIOCK.CONFIG.deathBag.stones).forEach((color) => {
    actorContext[`bag.stones.${color}`] = _loc("TERIOCK.TERMS.Stones.ofColor", {
      color: _loc(`TERIOCK.TERMS.StoneColor.${color}`),
    });
  });
  Object.entries(TERIOCK.CONFIG.attribute).forEach(([k, v]) => {
    const name = v.abbreviation;
    Object.assign(actorContext, {
      [`${k}.c`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.c", { name }),
      [`${k}.fluent`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.fluent", { name }),
      [`${k}.passive`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.passive", { name }),
      [`${k}.proficient`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.proficient", { name }),
      [`${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
    });
  });
  const initiative = _loc("TERIOCK.SHEETS.Actor.SIDEBAR.InitiativeBox.label");
  Object.assign(actorContext, {
    "initiative.c": _loc("TERIOCK.ROLL_CONTEXT.Mod.c", { name: initiative }),
    "initiative.fluent": _loc("TERIOCK.ROLL_CONTEXT.Mod.fluent", { name: initiative }),
    "initiative.proficient": _loc("TERIOCK.ROLL_CONTEXT.Mod.proficient", { name: initiative }),
  });
  Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).forEach(([k, v]) => {
    const name = v.label;
    Object.assign(actorContext, {
      [`tradecraft.${k}.c`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.c", { name }),
      [`tradecraft.${k}.fluent`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.fluent", { name }),
      [`tradecraft.${k}.proficient`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.proficient", { name }),
      [`tradecraft.${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
    });
  });
  Object.entries(TERIOCK.CONFIG.hack).forEach(([k, v]) => {
    Object.assign(actorContext, { [`hacks.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.hack", { part: v.part }) });
  });
  Object.entries(TERIOCK.CONFIG.class.classes).forEach(([k, v]) => {
    Object.assign(actorContext, { [`ranks.class.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.rank", { name: v.label }) });
  });
  Object.entries(TERIOCK.CONFIG.class.archetypes).forEach(([k, v]) => {
    Object.assign(actorContext, {
      [`ranks.archetype.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.archetype", { name: v.label }),
    });
  });
  Object.values(TERIOCK.CONFIG.character.movement).forEach(v => {
    Object.assign(actorContext, {
      [`speed.${v.slug}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.speedAdjustment", { type: v.label }),
    });
  });
  Object.values(TERIOCK.CONFIG.currency).forEach(v => {
    Object.assign(actorContext, {
      [`money.currency.${v.code}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.currency", { name: v.label }),
    });
  });
  Object.entries(game.teriock.identifiers.getNames("species", { permission: "LIMITED" })).forEach(([k, name]) => {
    Object.assign(actorContext, { [`species.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.species", { name }) });
  });
  Object.entries(TERIOCK.CONFIG.character.sense).forEach(([k, v]) => {
    Object.assign(actorContext, { [`sense.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.sense", { name: v.label }) });
  });
  Object.entries(TERIOCK.CONFIG.terrain.terrains).forEach(([k, v]) => {
    Object.assign(actorContext, { [`terrain.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.terrain", { name: v.label }) });
  });
  Object.entries(TERIOCK.STATUSES.conditions).forEach(([k, v]) => {
    Object.assign(actorContext, { [`condition.${k}`]: v.name });
  });
});
