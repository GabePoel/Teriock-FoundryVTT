export interface AppliesData {
  statuses: string[];
  damage: string[];
  drain: string[];
  changes: {
    key: string;
    mode: Number;
    value: string;
    priority: number;
  }
}