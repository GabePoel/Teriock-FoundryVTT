import { ApplyEffectHandler } from "./instances/apply-effect-handlers.mjs";
import { FeatSaveHandler } from "./instances/feat-save-handlers.mjs";
import { TakeHackHandler, TakeUnhackHandler } from "./instances/hack-handlers.mjs";
import { AwakenHandler, ReviveHandler } from "./instances/one-off-handlers.mjs";
import { ResistHandler } from "./instances/resistance-handlers.mjs";
import { RollRollableTakeHandler, TakeRollableTakeHandler } from "./instances/rollable-takes-handlers.mjs";
import { StandardDamageHandler } from "./instances/standard-damage.mjs";
import { ApplyStatusHandler, RemoveStatusHandler } from "./instances/status-handlers.mjs";
import { TradecraftCheckHandler } from "./instances/tradecraft-check-handlers.mjs";
import { UseAbilityHandler } from "./instances/use-ability-handlers.mjs";

/** @type {Record<string, ActionHandler>} */
const handlers = {
  [ApplyEffectHandler.ACTION]: ApplyEffectHandler,
  [ApplyStatusHandler.ACTION]: ApplyStatusHandler,
  [AwakenHandler.ACTION]: AwakenHandler,
  [FeatSaveHandler.ACTION]: FeatSaveHandler,
  [RemoveStatusHandler.ACTION]: RemoveStatusHandler,
  [ResistHandler.ACTION]: ResistHandler,
  [ReviveHandler.ACTION]: ReviveHandler,
  [RollRollableTakeHandler.ACTION]: RollRollableTakeHandler,
  [StandardDamageHandler.ACTION]: StandardDamageHandler,
  [TakeHackHandler.ACTION]: TakeHackHandler,
  [TakeRollableTakeHandler.ACTION]: TakeRollableTakeHandler,
  [TakeUnhackHandler.ACTION]: TakeUnhackHandler,
  [TradecraftCheckHandler.ACTION]: TradecraftCheckHandler,
  [UseAbilityHandler.ACTION]: UseAbilityHandler,
};

export default handlers;
