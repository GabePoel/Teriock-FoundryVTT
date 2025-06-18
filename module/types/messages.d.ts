export type MessageBar = {
  icon: string;
  wrappers: string[];
};

export type MessageBlock = {
  title: string;
  text?: string;
  special?: string;
  elements?: string;
};

export type MessageParts = {
  image: string;
  name: string;
  bars: MessageBar[];
  blocks: MessageBlock[];
  font: string | null;
};