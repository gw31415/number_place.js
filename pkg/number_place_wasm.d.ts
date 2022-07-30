/* tslint:disable */
/* eslint-disable */
/**
* Seekerによる探索の現在の状態を表します。
*/
export enum SeekerState {
/**
* Seekerによる探索が終了したことを示します。
*/
  Finished,
/**
* 1つの仮定が失敗したことを示します。
*/
  TryFail,
/**
* 1つの仮定が失敗しなかったことを示します。
*/
  TryContinue,
/**
* 1つの解答が発見されたことを示します。
*/
  Found,
}
/**
* この構造体にナンプレの数字を書き込んでいきます。
*/
export class Field {
  free(): void;
/**
* @param {Uint8Array | undefined} bytes
*/
  constructor(bytes?: Uint8Array);
/**
* @returns {Uint8Array}
*/
  bytes(): Uint8Array;
/**
* ナンプレに数字を記入します。
* @param {number} i
* @param {number} value
*/
  insert(i: number, value: number): void;
/**
* 指定した位置に入る可能性のある値一覧を返します。
* @param {number} i
* @returns {Uint32Array}
*/
  possiblity_at(i: number): Uint32Array;
}
/**
* Seekerの探索の現在の進捗を表す構造体です。
*/
export class Report {
  free(): void;
/**
* 解答が見つかった場合、解答を返します。
* 解答途中のフィールドを返せる場合、それを返します。
*/
  readonly field: Field | undefined;
/**
* 進捗メッセージを文字列で表します。
*/
  readonly msg: string;
/**
* 進捗をEnumで返します。
*/
  readonly state: number;
}
/**
* ナンプレの解答を探索する構造体です。
*/
export class Seeker {
  free(): void;
/**
* @param {Field} field
*/
  constructor(field: Field);
/**
* 探索を1ステップ進め、Reportを返します。
* @returns {Report}
*/
  next(): Report;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_field_free: (a: number) => void;
  readonly field_new: (a: number, b: number, c: number) => void;
  readonly field_bytes: (a: number, b: number) => void;
  readonly field_insert: (a: number, b: number, c: number, d: number) => void;
  readonly field_possiblity_at: (a: number, b: number, c: number) => void;
  readonly __wbg_seeker_free: (a: number) => void;
  readonly seeker_new: (a: number) => number;
  readonly seeker_next: (a: number) => number;
  readonly __wbg_report_free: (a: number) => void;
  readonly report_msg: (a: number, b: number) => void;
  readonly report_state: (a: number) => number;
  readonly report_field: (a: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
