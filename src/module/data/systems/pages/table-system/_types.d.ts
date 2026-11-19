import { ElderSorceryWordsModel } from "../../../models/_module.mjs";

declare module "./table-system.mjs" {
  export default interface TableSystem {
    words: ElderSorceryWordsModel;
  }
}

export {};
