import { ApplyEffectHandler } from "./apply-effect-handlers.mjs";
import { ChangeMovementButtonHandler } from "./change-movement-button-handler.mjs";
import { ExecuteMacroHandler } from "./execute-macro-handlers.mjs";
import {
  RollRollableTakeHandler,
  TakeRollableTakeHandler,
} from "./rollable-takes-handlers.mjs";
import {
  ApplyStatusHandler,
  AttuneHandler,
  AwakenHandler,
  DampenHandler,
  DeathBagHandler,
  DeattuneHandler,
  DestroyHandler,
  FeatHandler,
  GlueHandler,
  HealHandler,
  IdentifyHandler,
  ReadMagicHandler,
  ReforgeHandler,
  RemoveStatusHandler,
  RepairHandler,
  ResistHandler,
  RevitalizeHandler,
  ReviveHandler,
  ShatterHandler,
  StandardDamageHandler,
  TakeHackHandler,
  TakeUnhackHandler,
  ToggleStatusHandler,
  TradecraftCheckHandler,
  UndampenHandler,
  UnglueHandler,
  UseExternalHandler,
  UseLocalHandler,
} from "./simple-command-handlers.mjs";

/** @type {typeof BaseButtonHandler[]} */
const handlerArray = [
  ApplyEffectHandler,
  ApplyStatusHandler,
  AttuneHandler,
  AwakenHandler,
  ChangeMovementButtonHandler,
  DampenHandler,
  DeathBagHandler,
  DeattuneHandler,
  DestroyHandler,
  ExecuteMacroHandler,
  FeatHandler,
  GlueHandler,
  HealHandler,
  IdentifyHandler,
  ReadMagicHandler,
  ReforgeHandler,
  RemoveStatusHandler,
  RepairHandler,
  ResistHandler,
  RevitalizeHandler,
  ReviveHandler,
  RollRollableTakeHandler,
  ShatterHandler,
  StandardDamageHandler,
  TakeHackHandler,
  TakeRollableTakeHandler,
  TakeUnhackHandler,
  ToggleStatusHandler,
  TradecraftCheckHandler,
  UndampenHandler,
  UnglueHandler,
  UseExternalHandler,
  UseLocalHandler,
];

/** @type {Record<string, typeof BaseButtonHandler>} */
const handlers = {};
for (const handler of handlerArray) {
  handlers[handler.ACTION] = handler;
}

export default handlers;
