// Build / update the 'context' object (immutable)
export function getContext(state, settings, metrics, fps) {
	const rect = settings.element.getBoundingClientRect()
	const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
	const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
	return Object.freeze({
		frame : state.frame,
		time : state.time,
		cols,
		rows,
		metrics,
		width : rect.width,
		height : rect.height,
		settings,
		// Runtime & debug data
		runtime : Object.freeze({
			cycle : state.cycle,
			fps : fps.fps
		})
	})
}

export function calcMetrics(el) {

	const style = getComputedStyle(el)
	const fontFamily = style.getPropertyValue('font-family')
	const fontSize   = parseFloat(style.getPropertyValue('font-size'))
	// https://bugs.webkit.org/show_bug.cgi?id=225695
	const lineHeight = parseFloat(style.getPropertyValue('line-height'))
	let cellWidth

	if (el.nodeName == 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
		cellWidth = ctx.measureText(''.padEnd(50, '╳')).width / 50
	} else {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(50, '╳')
		cellWidth = span.getBoundingClientRect().width / 50
		el.removeChild(span)
	}

	const metrics = {
		aspect : cellWidth / lineHeight,
		cellWidth,
		lineHeight,
		fontFamily,
		fontSize,
		// // allow an update of the metrics object.
		_update : function(m) {
			const tmp = calcMetrics(el)
			for(var k in tmp) {
				if (typeof tmp[k] == 'number' || typeof tmp[k] == 'string') {
					m[k] = tmp[k]
				}
			}
		}
	}
	return metrics
}