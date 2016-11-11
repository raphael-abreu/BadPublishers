/**
Very trimmed-down version of Node's Buffer.
*/
interface Buffer {
  toString(encoding?: string, start?: number, end?: number): string;
  slice(start?: number, end?: number): Buffer;
  [index: number]: number;
  length: number;
}
declare var Buffer: {
  new (str: string, encoding?: string): Buffer;
  new (size: number): Buffer;
  byteLength(string: string, encoding?: string): number;
  concat(list: Buffer[], totalLength?: number): Buffer;
};
