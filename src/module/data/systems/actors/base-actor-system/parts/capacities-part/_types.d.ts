import { EvaluationModel } from "../../../../../models/_module.mjs";

export default interface ActorCapacitiesPartInterface {
  /** <base> Attunements - IDs of attuned equipment */
  attunements: Set<ID<TeriockEquipment>>;
  carryingCapacity: {
    factor: number;
    heavy: number;
    light: number;
    max: number;
  };
  /** <base> Encumbrance level */
  encumbranceLevel: number;
  /** <schema> Size */
  size: {
    /** <schema> Numbered size */
    number: EvaluationModel;
    /** <derived> Named size category */
    category: string;
    /** <derived> */
    reach: number;
    /** <derived> */
    length: number;
  };
  /** <schema> Weight of the actor and what they carry */
  weight: {
    /** <derived> Total weight carried by the actor (equipment + money) */
    carried: number;
    /** <derived> Weight of the actor's equipment */
    equipment: number;
    /** <derived> Weight of the actor's money */
    money: number;
    /** <schema> Weight of the actor */
    self: EvaluationModel;
    /** <derived> Total weight of the actor and everything they carry (self + carried) */
    value: number;
  };
}
