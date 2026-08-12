declare global {
  namespace Teriock.PseudoDocuments {
    export type SelectionPseudoDocumentData = {
      all: boolean;
      auto: boolean;
      expandFolders: boolean;
      expandTables: boolean;
      globalIdentifiers: Set<TypedIdentifier>;
      globalUuids: Set<UUID>;
      localIdentifiers: Set<TypedIdentifier>;
      localQualifier: Teriock.System.FormulaString;
      localUuids: Set<UUID>;
      makeSeparateActivations: boolean;
      multi: boolean;
      selectInExecution: boolean;
    };
  }
}

export {};
