declare global {
  namespace Teriock.Units {
    export type UnitEntry = {
      conversion?: number;
      id: string;
      label: string;
      plural?: string;
      scale?: number;
      symbol?: string;
      system?: string;
    };
  }

  namespace Teriock.Models {
    export type BaseUnitModelData = { unit: string };
  }
}

export {};
