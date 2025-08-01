/**
 * Pieces of a bar within a chat message.
 *
 * @property icon - Name of FontAwesome icon to display in the message bar.
 * @property wrappers - Strings to wrap within the message bar.
 */
export type MessageBar = {
  icon: string;
  label: string;
  wrappers: string[];
};

/**
 * Pieces of a block within a chat message.
 *
 * @property title - The title of the message block.
 * @property text - Optional. The main text content of the message block.
 * @property special - Optional. Special information for formatting.
 * @property elements - Optional. Elder Sorcery elements for formatting.
 */
export type MessageBlock = {
  title: string;
  text?: string;
  special?: string;
  elements?: string;
  italic?: boolean;
};

/**
 * Represents the individual rules-parts that make up a message.
 *
 * @property image - The URL or path to the image associated with the message.
 * @property name - The name or title to display in the message.
 * @property bars - An array of `MessageBar` objects.
 * @property blocks - An array of `MessageBlock` objects.
 * @property font - Font used for message, or `null` for default font.
 */
export type MessageParts = {
  image?: string;
  name?: string;
  bars?: Teriock.MessageBar[];
  blocks?: Teriock.MessageBlock[];
  font?: string | null;
};

/**
 * Options for configuring a message.
 *
 * @property secret - If true, the content of the message is obfuscated.
 */
export type MessageOptions = {
  secret?: boolean;
};

/**
 * Describes the origin of a {@link TeriockChatMessage}.
 */
export type ChatSpeakerData = {
  /** The `_id` of the {@link TeriockActor} who generated this message */
  actor?: string;
  /** An overridden alias name used instead of the {@link TeriockActor} or {@link TeriockToken} name */
  alias?: string;
  /** The `_id` of the {@link TeriockScene} where this message was created */
  scene?: string;
  /** The `_id` of the {@link TeriockToken} who generated this message */
  token?: string;
};
