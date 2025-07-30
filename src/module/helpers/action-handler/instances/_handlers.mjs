import { ApplyEffectHandler } from "./apply-effect-handlers.mjs";
import { FeatSaveHandler } from "./feat-save-handlers.mjs";
import { TakeHackHandler, TakeUnhackHandler } from "./hack-handlers.mjs";
import { AwakenHandler, ReviveHandler } from "./one-off-handlers.mjs";
import { ResistHandler } from "./resistance-handlers.mjs";
import { RollRollableTakeHandler, TakeRollableTakeHandler } from "./rollable-takes-handlers.mjs";
import { StandardDamageHandler } from "./standard-damage.mjs";
import { ApplyStatusHandler, RemoveStatusHandler } from "./status-handlers.mjs";
import { TradecraftCheckHandler } from "./tradecraft-check-handlers.mjs";
import { UseAbilityHandler } from "./use-ability-handlers.mjs";

/** @type {Record<string, ActionHandler>} */
export const handlers = {
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
