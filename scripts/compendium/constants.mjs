import { default as system } from "../../system.json" with { type: "json" };

export const BUILDER_NAME = "teriockBuilder00";
export const CORE_VERSION = system.compatibility.verified.toString();
export const EXPAND_ADVENTURES = true;
export const FOLDERS = true;
export const SYSTEM_ID = system.id;
export const SYSTEM_VERSION = system.version;
export const YAML = true;

export const BASIC_STATS = { coreVersion: CORE_VERSION, lastModifiedBy: BUILDER_NAME, systemId: SYSTEM_ID };
