interface DisplayField {
  size: string;
  gapless: boolean;
}

interface SheetDisplay {
  ability: DisplayField;
  fluency: DisplayField;
  rank: DisplayField;
  equipment: DisplayField;
  power: DisplayField;
  resource: DisplayField;
  condition: DisplayField;
  effect: DisplayField;
}

export interface SheetData {
  display: SheetDisplay;
  notes: string;
  dieBox: {
    hitDice: string;
    manaDice: string;
  };
  primaryBlocker: string | null;
  primaryAttacker: string | null;
}
