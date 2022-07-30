type Report = import('../static/pkg/number_place_wasm').Report;
type Field = import('../static/pkg/number_place_wasm').Field;
type Message = import('../static/round-robin').Message;

/// ページをリセットする
async function reset() {
	const main = document.getElementById('main')
	main.innerText = 'Loading....'
	// @ts-ignore
	const wasm: typeof import('../static/pkg/number_place_wasm') = await import('./pkg/number_place_wasm.js')
	await wasm.default()
	/// 操作するフィールド
	const field = new wasm.Field

	/// 総当たりボタン
	const button = document.createElement('button')
	button.innerText = 'Round-Robin'

	// テーブルの作成
	const table = document.createElement('div')
	table.style.width = '100%'
	table.style.aspectRatio = '1'
	table.style.border = 'solid 1px black'
	for (let r = 0; r < 9; r++) {
		const row = document.createElement('div')
		row.className = 'r'
		for (let c = r * 9; c < (r + 1) * 9; c++) {
			const cell = document.createElement('div')
			const input = document.createElement('input')
			cell.className = 'c'
			cell.id = `c${c}`
			input.inputMode = 'numeric'
			input.id = `i${c}`
			cell.replaceChildren(input)
			row.appendChild(cell)
		}
		table.appendChild(row)
	}

	// 本文への追加
	main.replaceChildren(
		table,
		button,
	)

	///  Fieldを画面に表示する
	function refresh(field: Field) {
		for (let i = 0; i < 81; i++) {
			const possiblity = field.possiblity_at(i)
			const cell = document.getElementById(`c${i}`) as HTMLDivElement
			let input = document.getElementById(`i${i}`) as HTMLInputElement
			if (input === null) {
				const new_input = document.createElement('input')
				new_input.id = `i${i}`
				new_input.inputMode = 'numeric'
				new_input.readOnly = true // inputが削除されているのを復活させるのはround-robinの際でreadOnlyになっているときのみ。
				cell.replaceChildren(new_input)
				input = document.getElementById(`i${i}`) as HTMLInputElement
			}
			if (possiblity.length === 1) {
				cell.innerText = `${possiblity[0]}`
			} else {
				input.placeholder = `[${possiblity.length}]`
			}
		}
	}

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
	button.addEventListener('click', () => {
		button.disabled = true
		button.innerText = "Loading..."
		Array.from(document.getElementsByTagName('input')).forEach((e) => {
			e.readOnly = true
		})
		const worker = new Worker('./round-robin.js')
		worker.onmessage = function(e: MessageEvent<Message>) {
			const report = e.data
			if (report.state === wasm.SeekerState.Finished) {
				worker.terminate()
			}
			button.innerText = report.msg
			if (report.field.length === 324) {
				const field = new wasm.Field(report.field);
				refresh(field)
			}
		};
		worker.postMessage(field.bytes())
	});
}
reset()
