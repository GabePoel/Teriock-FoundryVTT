import { DataFieldOptions } from "@common/data/_types.mjs";

declare module "./multi-change-field.mjs" {
  export default interface MultiChangeField extends Teriock.Fields._MultiChangeFieldOptions {
    options: DataFieldOptions & Teriock.Fields._MultiChangeFieldOptions;
  }
}

export {};
