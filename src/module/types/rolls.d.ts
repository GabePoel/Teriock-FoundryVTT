import { dieOptions } from "../constants/options/die-options.mjs";
import { TeriockToken } from "../canvas/placeables/_module.mjs";
import { TeriockActor } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Rolls {
    // noinspection SpellCheckingInspection
    export type RollMode =
      | "roll"
      | "publicroll"
      | "gmroll"
      | "blindroll"
      | "selfroll";

    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = keyof typeof dieOptions.faces;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;

    export type MacroScope = {
      actor?: TeriockActor;
      data?: Teriock.HookData.BaseHookData;
      event?: Event;
      speaker?: Teriock.Foundry.ChatSpeakerData;
      token?: TeriockToken;
      document?: TeriockChild;
    };
  }
}
