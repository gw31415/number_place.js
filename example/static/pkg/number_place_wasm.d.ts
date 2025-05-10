/* tslint:disable */
/* eslint-disable */
/**
 * Seekerによる探索の現在の状態を表します。
 */
export enum SeekerState {
  /**
   * Seekerによる探索が終了したことを示します。
   */
  Finished = 0,
  /**
   * 1つの仮定が失敗したことを示します。
   */
  TryFail = 1,
  /**
   * 1つの仮定が失敗しなかったことを示します。
   */
  TryContinue = 2,
  /**
   * 1つの解答が発見されたことを示します。
   */
  Found = 3,
}
/**
 * この構造体にナンプレの数字を書き込んでいきます。
 */
export class Field {
  free(): void;
  constructor(bytes?: Uint8Array | null);
  bytes(): Uint8Array;
  /**
   * ナンプレに数字を記入します。
   */
  insert(i: number, value: number): void;
  /**
   * 指定した位置に入る可能性のある値一覧を返します。
   */
  possiblity_at(i: number): Uint32Array;
}
/**
 * Seekerの探索の現在の進捗を表す構造体です。
 */
export class Report {
  private constructor();
  free(): void;
  /**
   * 進捗メッセージを文字列で表します。
   */
  readonly msg: string;
  /**
   * 進捗をEnumで返します。
   */
  readonly state: SeekerState;
  /**
   * 解答が見つかった場合、解答を返します。
   * 解答途中のフィールドを返せる場合、それを返します。
   */
  readonly field: Field | undefined;
}
/**
 * ナンプレの解答を探索する構造体です。
 */
export class Seeker {
  free(): void;
  constructor(field: Field);
  /**
   * 探索を1ステップ進め、Reportを返します。
   */
  next(): Report;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_field_free: (a: number, b: number) => void;
  readonly field_new: (a: number, b: number) => [number, number, number];
  readonly field_bytes: (a: number) => [number, number];
  readonly field_insert: (a: number, b: number, c: number) => [number, number];
  readonly field_possiblity_at: (a: number, b: number) => [number, number, number, number];
  readonly __wbg_seeker_free: (a: number, b: number) => void;
  readonly seeker_new: (a: number) => number;
  readonly seeker_next: (a: number) => number;
  readonly __wbg_report_free: (a: number, b: number) => void;
  readonly report_msg: (a: number) => [number, number];
  readonly report_state: (a: number) => number;
  readonly report_field: (a: number) => number;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
