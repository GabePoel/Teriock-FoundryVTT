import type { ApplicationV2 } from "@client/applications/api/_module.mjs";

declare module "./image-sheet.mjs" {
  export default interface TeriockImageSheet extends ApplicationV2 {
    img: string;
  }
}