export interface HierarchyDocumentInterface<Self extends TeriockChild> {
  system: Teriock.Documents.EffectModel | Teriock.Documents.ItemModel;

  addSub(sub: Self): Promise<void>;

  addSubs(subs: Self[]): Promise<void>;

  get allSubs(): Self[];

  get allSups(): Self[];

  deleteSubs(): Promise<void>;

  duplicate(): Promise<Self>;

  get metadata(): Teriock.Documents.ChildModelMetadata;

  get rootAllSubs(): Self[];

  get rootSubIds(): Set<Teriock.ID<Self>>;

  get rootSubs(): Self[];

  get source(): Self;

  get subIds(): Set<Teriock.ID<Self>>;

  get subs(): Self[];

  get sup(): Self | null;

  get supId(): Teriock.ID<Self>;
}
