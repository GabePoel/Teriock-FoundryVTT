declare global {
  namespace Teriock.Execution {
    export type ImmunityExecutionOptions = BaseExecutionOptions & {
      image?: string;
      wrappers?: string[];
      hex?: boolean;
    };
  }
}

export {};
