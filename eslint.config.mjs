import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
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
  _del: "readonly",
  _replace: "readonly",
  _loc: "readonly",
  canvas: "readonly",
  foundry: "readonly",
  game: "readonly",
  getDocumentClass: "readonly",
  io: "readonly",
  ui: "readonly",
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

const globalModule = {
  TokenMagic: "readonly",
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{mjs,ts}"],
    plugins: {
      jsdoc: jsdoc,
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globalDocuments,
        ...globalHelpers,
        ...globalClient,
        ...globalTeriock,
        ...globalModule,
      },
    },
    settings: {
      jsdoc: {
        preferredTypes: {
          ".<>": "<>",
          Object: "object",
          Function: "function",
        },
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: ["error", "smart"],
      "no-console": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-var": "error",
      "prefer-const": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "jsdoc/check-types": "warn",
    },
  },
  {
    files: ["src/macros/**/*.{js,mjs}"],
    languageOptions: { globals: { ...globalMacro } },
  },
  eslintConfigPrettier,
);
