onmessage = async function(e/*: MessageEvent<import('../static/pkg/number_place_wasm').Field>*/) {
	// @ts-ignore
	const wasm = await import('./pkg/number_place_wasm.js')
	await wasm.default()
	const field = new wasm.Field(e.data)
	const seeker = new wasm.Seeker(field)
	for (; ;) {
		const report = seeker.next()
		let message = {
			msg: report.msg,
			state: report.state,
		}
		if (report.result != null) {
			message.field = report.result.bytes()
		} else {
			message.field = Uint8Array.from([])
		}
		postMessage(message, [message.field.buffer])
		if (report.state === wasm.SeekerState.Finished || report.state === wasm.SeekerState.Found) break
	}
}
