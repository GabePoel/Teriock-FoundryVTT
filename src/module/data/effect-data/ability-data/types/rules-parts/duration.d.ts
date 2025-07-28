export type NormalDurationUnit =
  | "year"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "instant"
  | "noLimit";

export type Duration = {
  unit: NormalDurationUnit;
  quantity: number;
  description: string;
  conditions: {
    absent: Set<Teriock.ConditionKey>;
    present: Set<Teriock.ConditionKey>;
  };
};
