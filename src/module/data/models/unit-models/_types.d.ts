declare global {
  namespace Teriock.Units {
    export type UnitEntry = {
      conversion?: number;
      id: string;
      label: string;
      plural?: string;
      scale?: number;
      system?: string;
      symbol?: string;
    };
  }

  namespace Teriock.Models {
    export type BaseUnitModelData = {
      unit: string;
    };

    export type DurationModelData = {
      conditions: {
        absent: Set<Teriock.Keys.Condition>;
        present: Set<Teriock.Keys.Condition>;
      };
      description: string;
      triggers: Set<string>;
    };
  }
}

export {};
