import {SeekerState} from "./pkg/number_place_wasm"
export type Message = {
	msg: string,
	field: Uint8Array,
	state: SeekerState,
}
