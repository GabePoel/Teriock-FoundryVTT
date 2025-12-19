export interface StatDieData {
  disabled: boolean;
  faces: number;
  flavor: string;
  index: number;
  path: string;
  rolled: boolean;
  spent: boolean;
  stat: string;
  value: number;
}

declare global {
  namespace Teriock.Models {
    export interface StatDieModelInterface extends StatDieData {
      toObject(): StatDieData;
    }
  }
}

export {};
