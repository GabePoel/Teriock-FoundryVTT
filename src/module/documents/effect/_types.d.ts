import { HierarchyDocumentInterface } from "../mixins/child-document-mixin/parts/_types";

declare module "./effect.mjs" {
  export default interface TeriockEffect
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument>,
      HierarchyDocumentInterface<TeriockEffect> {
    parent: TeriockParent;

    get documentName(): "ActiveEffect";
  }
}

export {};
