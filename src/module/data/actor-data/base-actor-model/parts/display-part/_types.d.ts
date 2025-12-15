export default interface ActorDisplayPartInterface {
  /** <base> HTML strings that get displayed on the sheet */
  sheet: SheetData;
  /** <schema> Notes about the actor */
  notes: string;
}

export interface SheetData {
  dieBox: {
    hp: string;
    mp: string;
  };
  primaryAttacker: string | null;
  primaryBlocker: string | null;
}
