import type { TeriockDragDrop } from "../../../../ux/_module.mjs";
import type {
  TeriockEffect,
  TeriockItem,
  TeriockJournalEntryPage,
  TeriockMacro,
} from "../../../../../documents/_module.mjs";

export type DropData<T> = {
  data?: T;
  uuid: Teriock.UUID<T>;
  type: "ActiveEffect" | "Item" | "Macro" | "Actor";
  systemType?: Teriock.Documents.CommonType;
};

export interface DragDropCommonSheetPartInterface {
  /**
   * Checks if drag and drop is allowed.
   * @private
   */
  _canDragDrop(): boolean;

  /**
   * Checks if drag start is allowed.
   * @private
   */
  _canDragStart(): boolean;

  /**
   * Checks if some other document can be dropped on this document.
   * @private
   */
  _canDrop(doc: TeriockCommon): boolean;

  /**
   * Handles drag over events.
   * @private
   */
  _onDragOver(event: DragEvent): Promise<void>;

  /**
   * Handles drag start events.
   * @private
   */
  _onDragStart(event: DragEvent): Promise<void>;

  /**
   * Handles drop events.
   * @returns {Promise<boolean>} Promise that resolves to true if the drop was handled.
   * @private
   */
  _onDrop(event: DragEvent): Promise<boolean>;

  /**
   * Handles dropping of active effects.
   * @param {DragEvent} event - The drop event.
   * @param {DropData<TeriockEffect>} data - The effect drop data.
   * @returns {Promise<TeriockEffect|void>} Promise that resolves to the effect if the drop was successful.
   * @private
   */
  _onDropActiveEffect(
    event: DragEvent,
    data: DropData<TeriockEffect>,
  ): Promise<TeriockEffect | void>;

  /**
   * Handles dropping of items.
   * @param {DragEvent} event - The drop event.
   * @param {DropData<TeriockItem>} data - The item drop data.
   * @returns {Promise<TeriockItem|void>} Promise that resolves to the item if the drop was successful.
   * @private
   */
  _onDropItem(
    event: DragEvent,
    data: DropData<TeriockItem>,
  ): Promise<TeriockItem | void>;

  /**
   * Handles dropping of journal entry pages.
   * @param {DragEvent} event - The drop event.
   * @param {DropData<TeriockJournalEntryPage>} data - The journal entry page drop data.
   * @returns {Promise<TeriockJournalEntryPage|void>} Promise that resolves to the journal entry page if the drop was
   * successful.
   * @private
   */
  _onDropJournalEntryPage(
    event: DragEvent,
    data: DropData<TeriockJournalEntryPage>,
  ): Promise<TeriockJournalEntryPage | void>;

  /**
   * Handles dropping of macros.
   * @param {DragEvent} event - The drop event.
   * @param {DropData<TeriockMacro>} data - The macro drop data.
   * @returns {Promise<TeriockMacro|void>} Promise that resolves to the macro if the drop was successful.
   * @private
   */
  _onDropMacro(
    event: DragEvent,
    data: DropData<TeriockMacro>,
  ): Promise<TeriockMacro | void>;

  /**
   * Gets the drag and drop handlers for this sheet.
   * @returns {TeriockDragDrop[]} Array of drag and drop handlers.
   */
  get dragDrop(): TeriockDragDrop[];
}
