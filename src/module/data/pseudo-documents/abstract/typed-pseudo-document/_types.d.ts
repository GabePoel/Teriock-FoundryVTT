import { TeriockDocumentSheet } from "../../../../applications/sheets/utility-sheets/_module.mjs";
import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Primary {
    export type PrimaryDocumentSchema = {
      _id: ID<PrimaryDocumentInterface>;
      img: string;
      name: string;
      type: string;
    };

    export interface PrimaryDocumentInterface {
      _onCreate(): void;

      _onDelete(): void;

      _onUpdate(): void;

      _preCreate(): Promise<void | false>;

      _preDelete(): Promise<void | false>;

      _preUpdate(): Promise<void | false>;

      get documentName(): string;

      get fieldPath(): string;

      get id(): ID<PrimaryDocumentInterface>;

      get metadata(): object;

      prepareBaseData(): void;

      prepareDerivedData(): void;

      prepareSpecialData(): void;

      get sheet(): TeriockDocumentSheet;

      get subs(): TypeCollection<
        PrimaryDocumentInterface,
        PrimaryDocumentInterface
      >;

      get uuid(): UUID<PrimaryDocumentInterface>;
    }

    export interface PrimaryDocumentStatic {
      CREATE_TEMPLATE: string;
      LOCALIZATION_PREFIXES: string[];

      create(
        data: object,
        operation: object,
      ): Promise<PrimaryDocumentInterface>;

      defineSchema(): object;

      get metadata(): object;
    }
  }
}

export {};
