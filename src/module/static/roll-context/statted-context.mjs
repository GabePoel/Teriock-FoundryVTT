import { preLocalizeObject } from "../../helpers/localization.mjs";

const stattedContext = {
  hp: "TERIOCK.ROLL_CONTEXT.StatDice.hpProvided",
  "hp.dice": "TERIOCK.ROLL_CONTEXT.StatDice.hpRemaining",
  "hp.dice.largest": "TERIOCK.ROLL_CONTEXT.StatDice.hpLargest",
  "hp.dice.max": "TERIOCK.ROLL_CONTEXT.StatDice.hpMax",
  "hp.dice.smallest": "TERIOCK.ROLL_CONTEXT.StatDice.hpSmallest",
  "hp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.hpDisabled",
  "hp.formula": "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.hp.label",
  mp: "TERIOCK.ROLL_CONTEXT.StatDice.mpProvided",
  "mp.dice": "TERIOCK.ROLL_CONTEXT.StatDice.mpRemaining",
  "mp.dice.largest": "TERIOCK.ROLL_CONTEXT.StatDice.mpLargest",
  "mp.dice.max": "TERIOCK.ROLL_CONTEXT.StatDice.mpMax",
  "mp.dice.smallest": "TERIOCK.ROLL_CONTEXT.StatDice.mpSmallest",
  "mp.disabled": "TERIOCK.ROLL_CONTEXT.StatDice.mpDisabled",
  "mp.formula": "TERIOCK.SYSTEMS.Statted.FIELDS.statDice.mp.label",
};

export default stattedContext;

preLocalizeObject("ROLL_CONTEXT.statted");
