import { DataFieldOptions } from "@common/data/_types.mjs";

declare module "./multi-change-field.mjs" {
  export default interface MultiChangeField {
    options: DataFieldOptions & Teriock.Fields._MultiChangeFieldOptions;
  }
}

export {};
