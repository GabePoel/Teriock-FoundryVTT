import { ElderSorceryWordsTable } from "../../../models/_module.mjs";

declare module "./elder-sorcery-automation.mjs" {
  export default interface ElderSorceryAutomation {
    elements: Set<Teriock.Keys.Element>;
    maxOp: Teriock.System.FormulaString;
    minOp: Teriock.System.FormulaString;
    parts: Set<Teriock.Keys.PartOfSpeech>;
    words: ElderSorceryWordsTable;
  }
}

export {};
