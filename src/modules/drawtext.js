const defaultTextBoxStyle = {
	x               : 1,
	y               : 1,
	width           : 0, 
	height          : 0, 
	paddingX        : 0, 
	paddingY        : 0, 
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round',
	shadowX         : 1, 
	shadowY         : 1, 
}

import { measure } from './string.js'
import { merge, setRect, mergeRect, mergeText } from './buffer.js'

export function drawTextBox(text, style, target, targetCols, targetRows) {

	const s = {...defaultTextBoxStyle, ...style}

	let boxWidth  = s.width
	let boxHeight = s.height

	if (!boxWidth || !boxHeight) {
		const m = measure(text.join('\n'))
		boxWidth = boxWidth || m.maxWidth + s.paddingX * 2
		boxHeight = boxHeight || m.numLines + s.paddingY * 2
	}

	const x1 = s.x
	const y1 = s.y
	const w  = boxWidth
	const h  = boxHeight

	// Background, overwrite the buffer
	setRect({
		char       : '/',
		color      : s.color,
		fontWeight     : s.fontWeight,
		backgroundColor : s.backgroundColor
	}, x1, y1, w, h, target, targetCols, targetRows)

	mergeText({
		text: text.join('\n'),
		color : style.color,
		backgroundColor : style.backgroundColor,
		fontWeight : style.weght
	}, x1+s.paddingX, y1+s.paddingY, target, targetCols, targetRows)
}