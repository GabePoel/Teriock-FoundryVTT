declare global {
  namespace Teriock.PseudoDocuments {
    export type SelectionPseudoDocumentData = {
      /** Whether all choices should be selected. */
      all: boolean;
      /** Whether one choice should be selected automatically if it's the only option. */
      auto: boolean;
      /** Whether folders should be recursively expanded. */
      expandFolders: boolean;
      /** Whether tables should be recursively expanded. */
      expandTables: boolean;
      /** Identifiers to get results from globally. */
      globalIdentifiers: Set<TypedIdentifier>;
      /** UUIDs to get results from globally. */
      globalUuids: Set<UUID>;
      /** Identifiers to get results from relative to some local document. */
      localIdentifiers: Set<TypedIdentifier>;
      /** Qualifier to get results from relative to some local document. */
      localQualifier: Teriock.System.FormulaString;
      /** Relative UUIDs to get results from relative to some local document. */
      localUuids: Set<UUID>;
      /** Whether each result should have a separate activation made. */
      makeSeparateActivations: boolean;
      /** Whether multiple choices can be selected. */
      multi: boolean;
      /** Whether choices should be selected at execution time. */
      selectInExecution: boolean;
    };
  }
}

export {};
