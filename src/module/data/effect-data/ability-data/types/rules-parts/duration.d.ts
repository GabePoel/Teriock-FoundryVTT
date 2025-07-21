export type NormalDurationUnit =
    "year"
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
        absent: Set<string>;
        present: Set<string>;
    };
};
