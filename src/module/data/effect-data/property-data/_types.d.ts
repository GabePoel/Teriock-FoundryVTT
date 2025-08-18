import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockProperty } from "../../../documents/_documents.mjs";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockBaseEffectData {
    /** Property Type */
    form: Teriock.Parameters.Shared.Form;
    /** Damage Type */
    damageType: string;

    get parent(): typeof TeriockProperty;
  }
}
