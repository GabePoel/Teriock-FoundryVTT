import { HTMLIdentifierTagsElement } from "../../../applications/elements/_module.mjs";

declare module "./typed-identifier-set-field.mjs" {
  export default interface TypedIdentifierSetField {
    element: HTMLIdentifierTagsElement;
    types: string[];
  }
}

export {};
