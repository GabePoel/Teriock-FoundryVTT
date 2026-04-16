import {
  localizeTypeContextKey,
  preLocalize,
} from "../../helpers/localization.mjs";
import { attributeOptions } from "../options/attribute-options.mjs";
import { characterOptions } from "../options/character-options.mjs";
import { documentOptions } from "../options/document-options.mjs";
import { hackOptions } from "../options/hack-options.mjs";
import { rankOptions } from "../options/rank-options.mjs";

const actorContext = {
  character: "TERIOCK.ROLL_CONTEXT.Type.character",
  creature: "TERIOCK.ROLL_CONTEXT.Type.creature",
  inventory: "TERIOCK.ROLL_CONTEXT.Type.inventory",
  lvl: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.lvl.label",
  p: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.p.label",
  f: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.f.label",

  "hp.value": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.hp.current",
  "hp.max": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.hp.max",
  "hp.min": "TERIOCK.ROLL_CONTEXT.Actor.hp.min",
  "hp.temp": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.hp.temp",
  "hp.morganti": "TERIOCK.ROLL_CONTEXT.Actor.hp.morganti",

  "mp.value": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.mp.current",
  "mp.max": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.mp.max",
  "mp.min": "TERIOCK.ROLL_CONTEXT.Actor.mp.min",
  "mp.temp": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.mp.temp",
  "mp.morganti": "TERIOCK.ROLL_CONTEXT.Actor.mp.morganti",

  "lp.value": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.lp.current",
  "lp.max": "TERIOCK.SHEETS.Actor.SIDEBAR.Bars.lp.max",
  "lp.min": "TERIOCK.ROLL_CONTEXT.Actor.lp.min",

  pres: "TERIOCK.ROLL_CONTEXT.Actor.pres.max",
  "pres.unused": "TERIOCK.ROLL_CONTEXT.Actor.pres.unused",
  "pres.used": "TERIOCK.ROLL_CONTEXT.Actor.pres.used",
  usp: "TERIOCK.ROLL_CONTEXT.Actor.usp",

  speed: "TERIOCK.ROLL_CONTEXT.Actor.speed",
  size: "TERIOCK.SHEETS.Actor.TABS.Details.size.label",
  weight: "TERIOCK.ROLL_CONTEXT.Actor.weight",

  "carry.factor": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.factor",
  "carry.heavy": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.heavyCapacity",
  "carry.heavy.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.1",
  "carry.light": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.lightCapacity",
  "carry.light.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.2",
  "carry.max": "TERIOCK.SHEETS.Actor.TABS.Details.carrying.maxCapacity",
  "carry.max.hit": "TERIOCK.SYSTEMS.BaseActor.ENCUMBRANCE.3",

  av: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.value.label",
  "av.worn": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.worn.label",
  "av.nat": "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.av.nat.label",
  ac: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.ac.label",
  bv: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.bv.label",
  cc: "TERIOCK.SYSTEMS.BaseActor.FIELDS.defense.cc.label",
  sb: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label",
  ap: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",

  "db.stones.black": "TERIOCK.TERMS.Stones.black",
  "db.stones.red": "TERIOCK.TERMS.Stones.red",
  "db.stones.white": "TERIOCK.TERMS.Stones.white",
  "db.pull": "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.pull.label",

  "money.debt": "TERIOCK.ROLL_CONTEXT.Actor.money.debt",
  "money.total": "TERIOCK.ROLL_CONTEXT.Actor.money.total",
};

export default actorContext;

preLocalize("rollContext.actor");
Hooks.once("i18nInit", () => {
  Object.entries(attributeOptions).forEach(([k, v]) => {
    const name = _loc(v.label);
    Object.assign(actorContext, {
      [`${k}`]: name,
      [`${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
      [`${k}.pas`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.passive", { name }),
      [`${k}.pro`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.pro", { name }),
      [`${k}.flu`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.flu", { name }),
    });
  });
  Object.entries(TERIOCK.reference.tradecrafts).forEach(([k, v]) => {
    const name = _loc(v);
    Object.assign(actorContext, {
      [`tc.${k}`]: name,
      [`tc.${k}.score`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.score", { name }),
      [`tc.${k}.pro`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.pro", { name }),
      [`tc.${k}.flu`]: _loc("TERIOCK.ROLL_CONTEXT.Mod.flu", { name }),
    });
  });
  Object.entries(hackOptions).forEach(([k, v]) => {
    Object.assign(actorContext, {
      [`hack.${k}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.hack", {
        part: _loc(v.part),
      }),
    });
  });
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    Object.assign(actorContext, {
      [`rank.${k.slice(0, 3)}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.rank", {
        name: v,
      }),
    });
  });
  Object.entries(rankOptions).forEach(([k, v]) => {
    Object.assign(actorContext, {
      [`rank.${k.slice(0, 3)}`]: _loc("TERIOCK.ROLL_CONTEXT.Actor.archetype", {
        name: _loc(v.name),
      }),
    });
  });
  Object.values(characterOptions.movementTypes).forEach((v) => {
    Object.assign(actorContext, {
      [`speed.${v.abbreviation}`]: _loc(
        "TERIOCK.ROLL_CONTEXT.Actor.speedAdjustment",
        { type: _loc(v.label) },
      ),
    });
  });
  Object.entries(documentOptions)
    .filter(([_k, v]) => v.doc === "Actor")
    .forEach(([k, _v]) => {
      localizeTypeContextKey(actorContext, k);
    });
});
