import { StringFieldOptions } from "@common/data/_types.mjs";

declare module "./identifier-field.mjs" {
  export default interface IdentifierField extends Teriock.Fields._IdentifierFieldOptions {
    options: StringFieldOptions & Teriock.Fields._IdentifierFieldOptions;
  }
}

export {};
