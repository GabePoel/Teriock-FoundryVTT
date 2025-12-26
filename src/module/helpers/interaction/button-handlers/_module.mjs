import { ApplyEffectHandler } from "./apply-effect-handlers.mjs";
import { ExecuteMacroHandler } from "./execute-macro-handlers.mjs";
import { FeatSaveHandler } from "./feat-save-handlers.mjs";
import { TakeHackHandler, TakeUnhackHandler } from "./hack-handlers.mjs";
import {
  AwakenHandler,
  DeathBagHandler,
  HealHandler,
  RevitalizeHandler,
  ReviveHandler,
} from "./one-off-handlers.mjs";
import { ResistHandler } from "./resistance-handlers.mjs";
import {
  RollRollableTakeHandler,
  TakeRollableTakeHandler,
} from "./rollable-takes-handlers.mjs";
import { StandardDamageHandler } from "./standard-damage.mjs";
import { ApplyStatusHandler, RemoveStatusHandler } from "./status-handlers.mjs";
import { TradecraftCheckHandler } from "./tradecraft-check-handlers.mjs";
import { UseAbilityHandler } from "./use-ability-handlers.mjs";

/** @type {typeof AbstractButtonHandler[]} */
const handlerArray = [
  ApplyEffectHandler,
  ApplyStatusHandler,
  AwakenHandler,
  DeathBagHandler,
  ExecuteMacroHandler,
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

/** @type {Record<string, typeof AbstractButtonHandler>} */
const handlers = {};
for (const handler of handlerArray) {
  handlers[handler.ACTION] = handler;
}

export default handlers;
