import { ApplyEffectHandler } from "./instances/apply-effect-handlers.mjs";
import { DeathBagHandler } from "./instances/death-bag-handlers.mjs";
import { FeatSaveHandler } from "./instances/feat-save-handlers.mjs";
import {
  TakeHackHandler,
  TakeUnhackHandler,
} from "./instances/hack-handlers.mjs";
import {
  AwakenHandler,
  HealHandler,
  RevitalizeHandler,
  ReviveHandler,
} from "./instances/one-off-handlers.mjs";
import { ResistHandler } from "./instances/resistance-handlers.mjs";
import {
  RollRollableTakeHandler,
  TakeRollableTakeHandler,
} from "./instances/rollable-takes-handlers.mjs";
import { StandardDamageHandler } from "./instances/standard-damage.mjs";
import {
  ApplyStatusHandler,
  RemoveStatusHandler,
} from "./instances/status-handlers.mjs";
import { TradecraftCheckHandler } from "./instances/tradecraft-check-handlers.mjs";
import { UseAbilityHandler } from "./instances/use-ability-handlers.mjs";

/** @type {typeof ActionHandler[]} */
const handlerArray = [
  ApplyEffectHandler,
  ApplyStatusHandler,
  AwakenHandler,
  DeathBagHandler,
  FeatSaveHandler,
  HealHandler,
  RemoveStatusHandler,
  ResistHandler,
  RevitalizeHandler,
  ReviveHandler,
  RollRollableTakeHandler,
  StandardDamageHandler,
  TakeHackHandler,
  TakeRollableTakeHandler,
  TakeUnhackHandler,
  TradecraftCheckHandler,
  UseAbilityHandler,
];

/** @type {Record<string, typeof ActionHandler>} */
const handlers = {};
for (const handler of handlerArray) {
  handlers[handler.ACTION] = handler;
}

export default handlers;
