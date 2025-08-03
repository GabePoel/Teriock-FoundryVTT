import type { iconStyles } from "../helpers/constants/icon-styles.mjs";

/**
 * Three-way toggle.
 */
export type ThreeToggle = -1 | 0 | 1;

export type IconStyle = keyof typeof iconStyles;

export type ContextMenuCallback = (target: HTMLElement) => unknown;

export type ContextMenuCondition = (html: HTMLElement) => boolean;

export type ContextMenuEntry = {
  callback: ContextMenuCallback;
  classes?: string;
  condition?: boolean | ContextMenuCondition;
  group?: string;
  icon?: string;
  name: string;
};
