import { ClientDocumentMixin } from "@client/documents/abstract/_module.mjs";
import { Document as FoundryDocument } from "@common/abstract/_module.mjs";

declare global {
  /**
   * A Foundry document instance with client-side behaviors from {@link ClientDocumentMixin}
   * (e.g. {@link ClientDocument.isOwner}, {@link ClientDocument.sheet}, {@link ClientDocument.visible}).
   */
  type ClientDocument = InstanceType<ReturnType<typeof ClientDocumentMixin>>;

  namespace Foundry {
    export type BarField = { max: number, min: number, value: number };

    /** The common/server Document class. Prefer {@link ClientDocument} for client document instances. */
    export class Document extends FoundryDocument {}

    export type ContextMenuCallback = (target: HTMLElement) => unknown;

    export type ContextMenuOptions = {
      attach?: boolean;
      eventName?: string;
      fixed?: boolean;
      forceDirection?: "down" | "up";
      jQuery?: boolean;
      onClose?: ContextMenuCallback;
      onOpen?: ContextMenuCallback;
    };
  }
}

export {};
