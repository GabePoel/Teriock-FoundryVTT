export type NormalDurationUnit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second";

export type PassiveDurationUnit = "always" | "up" | "down" | "alive" | "dead" | "stationary";

export type Duration = {
  unit: NormalDurationUnit | PassiveDurationUnit;
  quantity: number;
  description: string;
}