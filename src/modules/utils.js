// Build / update the 'context' object (immutable)
export function getContext(settings, metrics, fps) {
	const rect = settings.element.getBoundingClientRect()
	const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
	const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
	return Object.freeze({
		// frame : state.frame,
		// time : state.time,
		cols,
		rows,
		metrics,
		width : rect.width,
		height : rect.height,
		settings,
		// Runtime & debug data
		runtime : Object.freeze({
			// cycle : state.cycle,
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
	let cellWidth, cellHeight

	if (el.nodeName == 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
    const textMetric = ctx.measureText(''.padEnd(69, 'x')) //TODO: calc from settings.cols
		cellWidth = textMetric.width / 69
		cellHeight = textMetric.fontBoundingBoxAscent + textMetric.fontBoundingBoxDescent / 69
	} else {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(69, '╳')
		cellWidth = span.getBoundingClientRect().width / 69
		el.removeChild(span)
	}

	const metrics = {
		aspect : cellWidth / lineHeight,
		cellWidth,
		cellHeight,
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

export function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}
