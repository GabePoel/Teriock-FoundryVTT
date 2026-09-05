declare module "./construction-node.mjs" {
  export default interface ConstructionNode {
    name: string;
    parentId: ID<ConstructionNode>;
  }
}

export {};
