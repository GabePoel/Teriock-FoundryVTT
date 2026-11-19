import { ElderSorceryTable } from "../../../models/_module.mjs";

declare module "./table-system.mjs" {
  export default interface TableSystem {
    table: ElderSorceryTable;
  }
}

export {};
