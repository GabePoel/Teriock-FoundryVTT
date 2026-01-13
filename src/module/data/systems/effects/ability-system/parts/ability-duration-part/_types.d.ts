export default interface AbilityDurationPartInterface {
  /** <schema> Time and circumstances in which this ability is active */
  duration: Duration;
}

export type NormalDurationUnit =
  keyof typeof TERIOCK.options.ability.duration.unit;

export type Duration = {
  unit: NormalDurationUnit;
  quantity: number;
  description: string;
  conditions: {
    absent: Set<Teriock.Parameters.Condition.ConditionKey>;
    present: Set<Teriock.Parameters.Condition.ConditionKey>;
  };
  stationary: boolean;
};
