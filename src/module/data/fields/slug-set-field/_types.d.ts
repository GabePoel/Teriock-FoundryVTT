import { SlugField } from "../_module.mjs";

declare module "./slug-set-field.mjs" {
  export default interface SlugSetField {
    element: SlugField;
  }
}

export {};
