import { TeriockActor } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ApplicableEffectSystemData = {
      /** <schema> UUID of the document this is sourced from */
      _src: UUID<TeriockAbility> | null;
      /** <schema> Blocks representing the source */
      blocks: Teriock.Panels.PanelBlock[];
      /** <schema> If this was the result of an effect that went critical */
      critical: boolean;
      /** <schema> UUID of the actor which executed the ability this is sourced from */
      executor: UUID<TeriockActor> | null;
      /** <schema> How much the source was heightened */
      heightened: number;
    };
  }
}
