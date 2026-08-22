declare global {
  namespace Teriock.Metadata {
    export type BaseMetadata = {
      embed: false;
      initialKind?: string;
      panel: boolean;
      pseudos: Record<string, string>;
      tags: object;
      type: string;
    };

    export type PseudoDocumentMetadata = BaseMetadata & { documentName: string, icon: string };

    export type SystemMetadata = BaseMetadata & {
      childTypes: Teriock.Documents.ChildType[];
      disabledPath: "disabled" | "system.disabled" | null;
      hierarchy: boolean;
      preservedProperties: string[];
      tags: {
        armament: boolean;
        attunable: boolean;
        consumable: boolean;
        statGiver: boolean;
        usable: boolean;
        wiki: boolean;
      };
    };
  }
}

export {};
