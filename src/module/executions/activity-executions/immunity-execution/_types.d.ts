declare global {
  namespace Teriock.Execution {
    export type ImmunityExecutionOptions = BaseExecutionOptions & {
      hex?: boolean;
      img?: string;
      wrappers?: string[];
    };
  }
}

export {};
