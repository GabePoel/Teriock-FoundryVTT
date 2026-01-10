export interface StatDieData {
  disabled: boolean;
  faces: number;
  index: number;
  path: string;
  rolled: boolean;
  spent: boolean;
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
