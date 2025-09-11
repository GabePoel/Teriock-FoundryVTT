interface DisplayField {
  gapless: boolean;
  size: string;
}

interface SheetDisplay {
  ability: DisplayField;
  condition: DisplayField;
  effect: DisplayField;
  equipment: DisplayField;
  fluency: DisplayField;
  power: DisplayField;
  rank: DisplayField;
  resource: DisplayField;
}

export interface SheetData {
  dieBox: {
    hpDice: string;
    mpDice: string;
  };
  display: SheetDisplay;
  notes: string;
  primaryAttacker: string | null;
  primaryBlocker: string | null;
}
