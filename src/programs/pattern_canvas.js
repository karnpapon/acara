import { canvasFillStyle } from "/src/modules/setting.js"

export const settings = { 
  id : "pattern_canvas",
  fps : 30, 	
  renderer : 'canvas',
  eventListener: { 
    pattern: true, 
    canvas: true,
  },
  canvasOffset : {
    x : 'auto',
    y : 'auto'
  },
  fontSize: "32px",
  canvasSize : {
    width : 200,
    height : 200
  },
  backgroundColor : 'white',
  color : 'black'
}

const pattern = ['|','-']
const data = []
let cols, rows

export function pre(context, cursor, buffer) {
  const { settings: { cursorBrush, mode, color, backgroundColor } } =  context

	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
    for (let x=0; x<cols; x++) {
      for (let y=0; y<rows; y++) {
        const i = x + y
        const c = (x + y) % 2
        data[x+y*cols] = {
          // char : pattern[c][i % pattern[c].length],
          char : Math.random() < 0.5 ? '╱' : '╲',
          color, 
          backgroundColor
        }
      }
    }
    window.acara.pattern = data
	}
  
	if (cursor.pressed) {
    const x = Math.floor(cursor.x) 
    const y = Math.floor(cursor.y)
    if(data[x + y * cols]) {
      const newChar = mode.cmd === "erase" ? {char: '', color: 'black', backgroundColor: 'white'} : { char: cursorBrush.char, color, backgroundColor }
      data[x + y * cols] = newChar      
    }
	} 
}

export function main(coord, context, cursor, buffer) {
  const { settings: { cursorBrush, mode, canvasFill, color, backgroundColor }} = context
	const x = Math.floor(cursor.x) 
	const y = Math.floor(cursor.y) 

  if(data[coord.index]) {
    const u = data[coord.index]

    if (u.char === '') { 
      if (coord.x == x && coord.y == y) {
        return {
          char: cursorBrush.char, 
          color: color,
          backgroundColor: backgroundColor
        }
      }
    }

    if (coord.x == x && coord.y == y) return { 
      char: cursorBrush.char, 
      color: backgroundColor,
      backgroundColor: color
    }
  
    // no-hovered non-empty cell rendering.
    return {
      char : u.char,
      color: u.color,
      backgroundColor: u.backgroundColor
    }
  }

}