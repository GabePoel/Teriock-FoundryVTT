import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockProperty } from "../../../documents/_documents.mjs";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockBaseEffectData {
    /** Parent */
    parent: TeriockProperty;
    /** Property Type */
    form: Teriock.Parameters.Shared.Form;
    /** Damage Type */
    damageType: string;
  }
}
