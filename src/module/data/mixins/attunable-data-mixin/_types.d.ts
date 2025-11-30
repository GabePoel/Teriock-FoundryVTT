import { TeriockEquipment } from "../../../documents/_documents.mjs";

export interface AttunableDataMixinInterface {
  /** <schema> If this is equipment, it may be identified */
  identified?: boolean;
  /** <schema> If this is equipment, there may be an identification reference */
  reference?: UUID<TeriockEquipment>;
  /** <schema> Presence Tier */
  tier: Teriock.Fields.ModifiableDeterministic;
}
