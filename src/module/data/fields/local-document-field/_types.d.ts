import { StringFieldOptions } from "@common/data/_types.mjs";

declare module "./local-document-field.mjs" {
  export default interface LocalDocumentField extends Teriock.Fields._LocalDocumentFieldOptions {
    options: StringFieldOptions & Teriock.Fields._LocalDocumentFieldOptions;
  }
}

export {};
