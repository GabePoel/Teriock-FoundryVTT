export interface AppliesData {
  statuses: string[];
  damage: string[];
  drain: string[];
  changes: {
    key: string;
    mode: number;
    value: string;
    priority: number;
  };
}
