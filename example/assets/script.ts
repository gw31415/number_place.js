function refresh(field: import('../static/pkg/number_place_wasm').Field) {
	for (let i = 0; i < 81; i++) {
		const possiblity = field.possiblity_at(i)
		const input = document.getElementById(`i${i}`) as HTMLInputElement
		if (possiblity.length === 1) {
			const cell = document.getElementById(`c${i}`) as HTMLDivElement
			cell.innerText = `${possiblity[0]}`
		} else {
			input.placeholder = `[${possiblity.length}]`
		}
	}
}

(async () => {
	// @ts-ignore
	const wasm: typeof import('../static/pkg/number_place_wasm') = await import('./pkg/number_place_wasm.js')
	await wasm.default()
	const field = new wasm.Field
	for (let i = 0; i < 81; i++) {
		const input = document.getElementById(`i${i}`) as HTMLInputElement
		input.addEventListener(
			'input', () => {
				const inputstr = input.value
				input.value = ""
				if (inputstr.match(/^[1-9]$/g)) {
					const value = parseInt(inputstr)
					if (field.possiblity_at(i).includes(value)) {
						try {
							field.insert(i, value)
						} catch (e) {
							alert(e)
							document.location.reload()
						}
					} else {
						const cell = document.getElementById(`c${i}`)
						cell.style.backgroundColor = '#ff4b00';
						setTimeout(() => {
							cell.removeAttribute('style')
						}, 100);
					}
					refresh(field)
				}
			}
		)
	}
	const btn = document.getElementById('btn') as HTMLButtonElement
	btn.addEventListener('click', () => {
		btn.disabled = true
		btn.innerText = "Loading..."
		Array.from(document.getElementsByTagName('input')).forEach((e) => {
			e.readOnly = true
		})
		const seeker = new wasm.Seeker(field);
		setTimeout(() => {
			let report = seeker.next();
			console.log(report.msg)
			while (report.state !== wasm.SeekerState.Found && report.state !== wasm.SeekerState.Finished) {
				report = seeker.next()
				console.log(report.msg)
			}
			const result = report.result
			if (result !== null) {
				refresh(result)
				btn.innerText = "An answer Found."
			} else {
				btn.innerText = "No answer Found."
			}
		}, 0)
	});
})()
