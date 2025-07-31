export interface JobDefinition {
  name: string;
  cronTime: string;
  handler: () => Promise<void> | void;
}
