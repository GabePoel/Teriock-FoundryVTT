export type NormalDurationUnit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second" | "instant";

export type Duration = {
  unit: NormalDurationUnit;
  quantity: number;
  description: string;
  requiredConditions: {
    present: Set<string>;
    absent: Set<string>;
  };
};
