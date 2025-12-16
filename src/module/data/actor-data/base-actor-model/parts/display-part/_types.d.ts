export default interface ActorDisplayPartInterface {
  /** <schema> Notes about the actor */
  notes: string;
  /** <base> HTML strings that get displayed on the sheet */
  sheet: SheetData;
}

export interface SheetData {
  dieBox: {
    hp: string;
    mp: string;
  };
  primaryAttacker: string | null;
  primaryBlocker: string | null;
}
