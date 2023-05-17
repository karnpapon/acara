import { canvasFillStyle } from "/src/modules/setting.js"

const pattern = 'acara▒░   '

export const settings = { 
  id : "draw_canvas",
  fps : 30, 	
  renderer : 'canvas',
  canvasOffset : {
    x : 'auto',
    y : 'auto'
  },
  fontSize: "12px",
  canvasSize : {
    width : 500,
    height : 700
  },
  backgroundColor : 'white',
  color : 'black'
}

export function main(coord, context, cursor, buffer) {
  const { settings: { canvasFill }} = context
	const t = context.time * 0.001
	const x = coord.x
	const y = coord.y
	const o = Math.sin(x * Math.cos(t * 0.4)) * Math.sin(t) * 20
	const i = Math.round(Math.abs(x + y + o)) % pattern.length
	return {
		char   : pattern[i],
    color: canvasFillStyle[canvasFill].color,
    backgroundColor: canvasFillStyle[canvasFill].backgroundColor
	}
}


import { drawBox } from '/src/modules/drawbox.js'

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