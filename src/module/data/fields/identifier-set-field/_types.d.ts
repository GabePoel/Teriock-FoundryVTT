import { IdentifierField } from "../_module.mjs";

declare module "./identifier-set-field.mjs" {
  export default interface IdentifierSetField {
    element: IdentifierField;
  }
}

export {};
