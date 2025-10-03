import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
//noinspection SpellCheckingInspection
import tseslint from "typescript-eslint";

const globalDocuments = {
  ActiveEffect: "readonly",
  Actor: "readonly",
  ActorDelta: "readonly",
  Adventure: "readonly",
  AmbientLightDocument: "readonly",
  AmbientSoundDocument: "readonly",
  Card: "readonly",
  Cards: "readonly",
  ChatMessage: "readonly",
  Combat: "readonly",
  Combatant: "readonly",
  CombatantGroup: "readonly",
  DrawingDocument: "readonly",
  FogExploration: "readonly",
  Folder: "readonly",
  Item: "readonly",
  JournalEntry: "readonly",
  JournalEntryCategory: "readonly",
  JournalEntryPage: "readonly",
  Macro: "readonly",
  MeasuredTemplateDocument: "readonly",
  NoteDocument: "readonly",
  Playlist: "readonly",
  PlaylistSound: "readonly",
  RegionBehavior: "readonly",
  RegionDocument: "readonly",
  RollTable: "readonly",
  Scene: "readonly",
  Setting: "readonly",
  TableResult: "readonly",
  TileDocument: "readonly",
  TokenDocument: "readonly",
  User: "readonly",
  WallDocument: "readonly",
};

const globalHelpers = {
  Color: "readonly",
  Collection: "readonly",
  fromUuid: "readonly",
  fromUuidSync: "readonly",
  getDocumentClass: "readonly",
  Hooks: "readonly",
  ProseMirror: "readonly",
  Roll: "readonly",
  TextEditor: "readonly",
};

const globalClient = {
  CONFIG: "writable",
  CONST: "writable",
  Handlebars: "readonly",
  PIXI: "readonly",
  ProseMirror: "readonly",
  foundry: "readonly",
  getDocumentClass: "readonly",
  io: "readonly",
  ui: "readonly",
  canvas: "readonly",
  game: "readonly",
};

const globalMacro = {
  actor: "readonly",
  scope: "readonly",
};

const globalTeriock = {
  TERIOCK: "readonly",
  teriock: "readonly",
  tm: "readonly",
};

export default defineConfig([
  {
    extends: ["js/recommended"],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globalDocuments,
        ...globalHelpers,
        ...globalClient,
        ...globalTeriock,
      },
    },
    plugins: { js },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/macros/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globalMacro,
      },
    },
  },
  tseslint.configs.recommended,
]);
