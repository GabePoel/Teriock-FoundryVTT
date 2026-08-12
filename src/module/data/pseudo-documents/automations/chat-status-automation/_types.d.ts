declare module "./chat-status-automation.mjs" {
  export default interface ChatStatusAutomation {
    status: Teriock.Keys.Condition;
    relation: "apply" | "include" | "remove" | "toggle";
  }
}

export {};
