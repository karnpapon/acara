/**
@module   drawtext.js
@desc     Draw text (FIGlet)
@category public

A style object can be passed to override the default style:
*/

const defaultTextBoxStyle = {
	x               : 2,
	y               : 1,
	width           : 0, // auto width
	height          : 0, // auto height
	paddingX        : 0, // text offset from the left border
	paddingY        : 0, // text offset from the top border
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round',
	shadowX         : 2, // horizontal shadow offset
	shadowY         : 1, // vertical shadow offset
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

	// Txt
	mergeText({
		text: text.join('\n'),
		color : style.color,
		backgroundColor : style.backgroundColor,
		fontWeight : style.weght
	}, x1+s.paddingX, y1+s.paddingY, target, targetCols, targetRows)
}