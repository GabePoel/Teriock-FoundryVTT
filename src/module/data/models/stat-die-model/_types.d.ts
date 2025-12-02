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

declare module "./stat-die-model.mjs" {
  export default interface StatDieModel extends StatDieData {
    toObject(): StatDieData;
  }
}
