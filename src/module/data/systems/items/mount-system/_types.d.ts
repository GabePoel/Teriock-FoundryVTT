declare module "./mount-system.mjs" {
  export default interface MountSystem {
    /** <schema> If mount is mounted */
    mounted: boolean;
    /** <schema> Mount species or type */
    mountType: TypedIdentifier<"mount">;
  }
}

export {};
