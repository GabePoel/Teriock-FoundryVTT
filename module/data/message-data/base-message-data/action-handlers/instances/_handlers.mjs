import { ApplyEffectHandler } from "./apply-effect-handlers.mjs";
import { FeatSaveHandler } from "./feat-save-handlers.mjs";
import { TakeHackHandler, TakeUnhackHandler } from "./hack-handlers.mjs";
import { ResistHandler } from "./resistance-handlers.mjs";
import { RollRollableTakeHandler, TakeRollableTakeHandler } from "./rollable-takes-handlers.mjs";
import { ApplyStatusHandler, RemoveStatusHandler } from "./status-handlers.mjs";
import { TradecraftCheckHandler } from "./tradecraft-check-handlers.mjs";
import { UseAbilityHandler } from "./use-ability-handlers.mjs";

/** @type {Record<string, ActionHandler>} */
export const handlers = {
  [ApplyEffectHandler.ACTION]: ApplyEffectHandler,
  [FeatSaveHandler.ACTION]: FeatSaveHandler,
  [TakeHackHandler.ACTION]: TakeHackHandler,
  [TakeUnhackHandler.ACTION]: TakeUnhackHandler,
  [ResistHandler.ACTION]: ResistHandler,
  [RollRollableTakeHandler.ACTION]: RollRollableTakeHandler,
  [TakeRollableTakeHandler.ACTION]: TakeRollableTakeHandler,
  [ApplyStatusHandler.ACTION]: ApplyStatusHandler,
  [RemoveStatusHandler.ACTION]: RemoveStatusHandler,
  [TradecraftCheckHandler.ACTION]: TradecraftCheckHandler,
  [UseAbilityHandler.ACTION]: UseAbilityHandler,
};
