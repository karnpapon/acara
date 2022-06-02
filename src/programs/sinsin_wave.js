/**
[header]
@author ertdfgcvb
@title  Sin Sin
@desc   Wave variation
*/

import { canvasFillStyle } from "/src/modules/setting.js"

const pattern = '┌┘└┐╰╮╭╯'

export const settings = { 
  fps : 30, 	
  renderer : 'canvas',
  canvasSize : {
    width : 500,
    height : 700
  },
  backgroundColor : 'white',
  color : 'black'
}

const { sin, round, abs } = Math

export function main(coord, context, cursor, buffer) {
  const { settings: { canvasFill }} = context
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	// const o = sin(y * x * sin(t) * 0.003 + y * 0.01 + t) * 10
	const o = sin(y * x * 0.003 + y * 0.01 ) 
	const i = round(abs(x + y + o)) % pattern.length
	return { 
    char: pattern[i], 
    color: canvasFillStyle[canvasFill].color,
    backgroundColor: canvasFillStyle[canvasFill].backgroundColor
  }
}

import { drawBox } from '/src/modules/drawbox.js'
// export function post(context, cursor, buffer) {
// 	drawInfo(context, cursor, buffer, { shadowStyle : 'gray' })
// }

const boxStyle = {
  x               : 12,
  y               : 2,
	width           : 44,
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round',
}

export function post(context, cursor, buffer) {

  const { rows, cols, settings: { generateData, generateBox } } =  context
  const textBoxStyle = {...boxStyle, ...generateBox.pos, ...generateBox.style}

  if (Object.keys(generateData).length === 0) return 

  let txt = Object.keys(generateData).reduce( (acc,curr) => { 
    if (["width", "height"].includes(curr)) return acc
    acc += curr + ' : ' + generateData[curr] + "\n" 
    return acc
  } , "")

  drawBox(txt, textBoxStyle, buffer, cols, rows)
}