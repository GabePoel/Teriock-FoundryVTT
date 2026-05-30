import { preLocalize } from "../../helpers/localization.mjs";

const actorContext = {
  c: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.c.label",
  f: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.f.label",
  lvl: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.lvl.label",
  p: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.p.label",

  "hp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.max.label",
  "hp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.min.label",
  "hp.morganti": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.morganti.label",
  "hp.temp": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.temp.label",
  "hp.value": "TERIOCK.SYSTEMS.BaseActor.FIELDS.hp.value.label",

  "mp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.max.label",
  "mp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.min.label",
  "mp.morganti": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.morganti.label",
  "mp.temp": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.temp.label",
  "mp.value": "TERIOCK.SYSTEMS.BaseActor.FIELDS.mp.value.label",

  "lp.max": "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.max.label",
  "lp.min": "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.min.label",
  "lp.value": "TERIOCK.SYSTEMS.BaseActor.FIELDS.lp.value.label",

  pres: "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.max.label",
  "pres.unused": "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.unused.label",
  "pres.used": "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.used.label",
  usp: "TERIOCK.SYSTEMS.BaseActor.FIELDS.presence.used.label",

  size: "TERIOCK.SHEETS.Actor.TABS.Details.size.label",
  speed: "TERIOCK.SYSTEMS.BaseActor.FIELDS.speed.label",
  weight: "TERIOCK.SYSTEMS.BaseActor.FIELDS.weight.label",

  "carry.factor": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.factor",
  "carry.heavy": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.heavyCapacity",
  "carry.heavy.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1",
  "carry.light": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.lightCapacity",
  "carry.light.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
  "carry.max": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.maxCapacity",
  "carry.max.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3",

  ac: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.ac.label",
  ap: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
  av: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.value.label",
  "av.nat": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.nat.label",
  "av.worn": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.worn.label",
  av0: "TERIOCK.TERMS.Properties.armorVoiding",
  bv: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.bv.label",
  cc: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.cc.label",
  h: "TERIOCK.ROLL_CONTEXT.Execution.h",
  hit: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
  sb: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label",
  ub: "TERIOCK.TERMS.Properties.unblockable",
  warded: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",

  "db.pull": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.pull.label",
  "db.stones.black": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.stones.black.label",
  "db.stones.red": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.stones.red.label",
  "db.stones.white": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.stones.white.label",

  "money.debt": "TERIOCK.SYSTEMS.BaseActor.FIELDS.money.debt.label",
  "money.total": "TERIOCK.SYSTEMS.BaseActor.FIELDS.money.total.label",
};

export default actorContext;

preLocalize("rollContext.actor");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.document).filter(([_k, v]) => v.documentName === "Actor").forEach(([k, v]) => {
    actorContext[k] = _loc(v?.label);
  });
  Object.entries(TERIOCK.config.attribute).forEach(([k, v]) => {
    const name = _loc(v.abbreviation);
    Object.assign(actorContext, {
      [`${k}.flu`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.flu", { name }),
      [`${k}.pas`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.passive", { name }),
      [`${k}.pro`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.pro", { name }),
      [`${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
      [`${k}`]: name,
    });
  });
  Object.entries(TERIOCK.reference.tradecrafts).forEach(([k, v]) => {
    const name = _loc(v);
    Object.assign(actorContext, {
      [`tc.${k}.flu`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.flu", { name }),
      [`tc.${k}.pro`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.pro", { name }),
      [`tc.${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
      [`tc.${k}`]: name,
    });
  });
  Object.entries(TERIOCK.config.hack).forEach(([k, v]) => {
    Object.assign(actorContext, { [`hack.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.hack", { part: _loc(v.part) }) });
  });
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    Object.assign(actorContext, { [`rank.${k.slice(0, 3)}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.rank", { name: v }) });
  });
  Object.entries(TERIOCK.config.class.archetypes).forEach(([k, v]) => {
    Object.assign(actorContext, {
      [`rank.${k.slice(0, 3)}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.archetype", { name: _loc(v.label) }),
    });
  });
  Object.values(TERIOCK.config.character.movement).forEach(v => {
    Object.assign(actorContext, {
      [`speed.${v.abbreviation}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.speedAdjustment", { type: _loc(v.label) }),
    });
  });
});
