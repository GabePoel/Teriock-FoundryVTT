import { AttributeModel, TradecraftModel } from "../data/models/modifier-models/_module.mjs";
import { TeriockActor } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Execution {
    /**
     * Execution construction context.
     */
    export type ExecutionOptions = {
      actor?: TeriockActor;
      boosts?: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
      competence?: Teriock.System.CompetenceLevel;
      event?: PointerEvent;
      messageMode?: Teriock.Messages.Mode;
      rollData?: object;
      rollOptions?: object;
      showDialog?: boolean;
      source?: AnyChildDocument | AttributeModel | TradecraftModel;
    };

    /**
     * An event parsed into execution schema `data` and construction `options`, returned by `parseEvent` and merged
     * into the two bags by `use`.
     */
    export type ParsedEvent = { data: object, options: Partial<ExecutionOptions> };
  }
}
