onmessage = async function(e: MessageEvent<Uint8Array>) {
	// @ts-ignore
	const wasm: typeof import('../static/pkg/number_place_wasm') = await import('./pkg/number_place_wasm.js')
	await wasm.default()
	const field = new wasm.Field(e.data)
	const seeker = new wasm.Seeker(field)
	const interbal = 1000 / 50 // 1フレーム毎のミリ秒数: これは50fps
	let prevTime = 0;
	for (; ;) {
		const report = seeker.next()
		const toBreak = report.state === wasm.SeekerState.Finished || report.state === wasm.SeekerState.Found;
		const now = Date.now()
		let message: any = {
			msg: report.msg,
			state: report.state,
		}
		if (report.field != null && (prevTime + interbal < now || toBreak)) {
			prevTime = now
			message.field = report.field.bytes()
		} else {
			message.field = Uint8Array.from([])
		}
		// @ts-ignore
		postMessage(message, [message.field.buffer])
		if (toBreak) break
	}
}
