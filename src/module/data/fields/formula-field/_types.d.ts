import { StringFieldOptions } from "@common/data/_types.mjs";

declare module "./formula-field.mjs" {
  export default interface FormulaField {
    options: StringFieldOptions & Teriock.Fields._FormulaFieldOptions;
  }
}

export {};
