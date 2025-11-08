import type { HierarchyDocumentInterface } from "../mixins/child-document-mixin/parts/_types";

declare module "./effect.mjs" {
  export default interface TeriockEffect
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument>,
      HierarchyDocumentInterface<TeriockEffect> {
    _id: Teriock.ID<TeriockEffect>;
    system: Teriock.Documents.EffectModel;

    get documentName(): "ActiveEffect";

    get id(): Teriock.ID<TeriockEffect>;

    get parent(): TeriockParent;

    get uuid(): Teriock.UUID<TeriockEffect>;
  }
}

export {};
