import { preLocalizeConfig } from "../../helpers/localization.mjs";

const combatConfig = {
  event: {
    action: "TERIOCK.COMBAT.Event.action",
    combat: "TERIOCK.COMBAT.Event.combat",
    round: "TERIOCK.COMBAT.Event.round",
    turn: "TERIOCK.COMBAT.Event.turn",
  },
  maxActions: 3,
  maxReactions: 1,
  relation: {
    everyone: "TERIOCK.COMBAT.Relation.everyone",
    executor: "TERIOCK.COMBAT.Relation.executor",
    target: "TERIOCK.COMBAT.Relation.target",
  },
  // no sort
  timing: { start: "TERIOCK.COMBAT.Timing.start", end: "TERIOCK.COMBAT.Timing.end" },
};

preLocalizeConfig("CONFIG.combat.event");
preLocalizeConfig("CONFIG.combat.relation");
preLocalizeConfig("CONFIG.combat.timing");

export default combatConfig;
