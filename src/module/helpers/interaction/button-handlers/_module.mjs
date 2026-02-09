import { ApplyEffectHandler } from "./apply-effect-handlers.mjs";
import { ExecuteMacroHandler } from "./execute-macro-handlers.mjs";
import {
  RollRollableTakeHandler,
  TakeRollableTakeHandler,
} from "./rollable-takes-handlers.mjs";
import {
  ApplyStatusHandler,
  AwakenHandler,
  DeathBagHandler,
  FeatHandler,
  HealHandler,
  RemoveStatusHandler,
  ResistHandler,
  RevitalizeHandler,
  ReviveHandler,
  StandardDamageHandler,
  TakeHackHandler,
  TakeUnhackHandler,
  ToggleStatusHandler,
  TradecraftCheckHandler,
  UseAbilityHandler,
} from "./simple-command-handlers.mjs";

/** @type {typeof AbstractButtonHandler[]} */
const handlerArray = [
  ApplyEffectHandler,
  ApplyStatusHandler,
  AwakenHandler,
  DeathBagHandler,
  ExecuteMacroHandler,
  FeatHandler,
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
  ToggleStatusHandler,
  TradecraftCheckHandler,
  UseAbilityHandler,
];

/** @type {Record<string, typeof AbstractButtonHandler>} */
const handlers = {};
for (const handler of handlerArray) {
  handlers[handler.ACTION] = handler;
}

export default handlers;
