import { preLocalize } from "../../helpers/localization.mjs";

const combatConfig = {
  event: {
    action: "TERIOCK.COMBAT.Event.action",
    combat: "TERIOCK.COMBAT.Event.combat",
    round: "TERIOCK.COMBAT.Event.round",
    turn: "TERIOCK.COMBAT.Event.turn",
  },
  relation: {
    everyone: "TERIOCK.COMBAT.Relation.everyone",
    executor: "TERIOCK.COMBAT.Relation.executor",
    target: "TERIOCK.COMBAT.Relation.target",
  },
  // no sort
  timing: { start: "TERIOCK.COMBAT.Timing.start", end: "TERIOCK.COMBAT.Timing.end" },
};

preLocalize("config.combat.event");
preLocalize("config.combat.relation");
preLocalize("config.combat.timing");

export default combatConfig;
