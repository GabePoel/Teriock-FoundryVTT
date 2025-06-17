import { _defineBasics } from "./_define-basics.mjs";
import { _defineCapacities } from "./_define-capacities.mjs";
import { _defineCombat } from "./_define-combat.mjs";
import { _defineDamage } from "./_define-damage.mjs";
import { _defineHacks } from "./_define-hacks.mjs";
import { _defineMoney } from "./_define-money.mjs";
import { _defineSenses } from "./_define-senses.mjs";
import { _defineSheet } from "./_define-sheet.mjs";
import { _defineSpeed } from "./_define-speed.mjs";
import { _defineStats } from "./_define-stats.mjs";
import { _defineTradecrafts } from "./_define-tradecrafts.mjs";

export function _defineSchema() {
  let schema = {};
  schema = _defineBasics(schema);
  schema = _defineCapacities(schema);
  schema = _defineCombat(schema);
  schema = _defineDamage(schema);
  schema = _defineHacks(schema);
  schema = _defineMoney(schema);
  schema = _defineSenses(schema);
  schema = _defineSheet(schema);
  schema = _defineSpeed(schema);
  schema = _defineStats(schema);
  schema = _defineTradecrafts(schema);
  return schema;
}