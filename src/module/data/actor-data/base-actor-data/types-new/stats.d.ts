export type Derived = {
  /** @base */
  raw: string;
  /** @derived */
  value: number;
};

export type BaseDerived = {
  /** @base */
  raw: string;
  /** @base */
  value: number;
};

export type ActorStat = {
  species: BaseDerived;
  class: BaseDerived;
  other: BaseDerived;
  /** @base */
  max: number;
  /** @base */
  min: number;
  /** @derived */
  critical: number;
  /** @stored */
  value: number;
  /** @stored */
  temp: number;
};
