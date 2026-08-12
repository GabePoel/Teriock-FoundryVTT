import { LightData } from "@common/data/data.mjs";

declare module "./light-automation.mjs" {
  export default interface LightAutomation {
    light: LightData;
  }
}

export {};
