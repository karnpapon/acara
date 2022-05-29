import { drawBox, drawInfo } from '/src/modules/drawbox.js'
import { drawTextBox } from '/src/modules/drawtext.js'

export const settings = { 
  fps : 30, 	
  renderer : 'canvas',
  canvasOffset : {
    x : 'auto',
    y : 'auto'
  },
  canvasSize : {
    width : 500,
    height : 700
  },
  // cols : 64,
  // rows : 22,
  backgroundColor : 'white',
  color : 'black'
}

const data = []
let cols, rows

// width = context.metrics.cellWidth * context.rows

export function pre(context, cursor, buffer) {
  const { settings: { drawChar, mode  }} = context
	const x = Math.floor(cursor.x) // column of the cell hovered
	const y = Math.floor(cursor.y) // row of the cell hovered

	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
		// data.length = cols * rows
    data.push(...buffer)
		// data.fill({ char: '', color: 'black', backgroundColor: 'white'})
	}
  
	if (cursor.pressed) {
    if(data[x + y * cols]) {
      const newChar = mode === "erase" ? {char: '', color: 'black', backgroundColor: 'white'} : { char: drawChar.char, color: mode === 'drawTextColor' ?  'red' : data[x + y * cols]["color"], backgroundColor: mode === 'drawBg' ? 'lightblue' : data[x + y * cols]["backgroundColor"] }
      data[x + y * cols] = newChar      
    }
	} 
	
}

export function main(coord, context, cursor, buffer) {
  const { settings: { drawChar, mode }} = context
	const x = Math.floor(cursor.x) 
	const y = Math.floor(cursor.y) 
	
  if(data[coord.index]) {
    const u = data[coord.index]
  
    // determine rendering empty cells (and when cursor is hovering these).
    if (u.char === '') { 
      if (coord.x == x && coord.y == y) { 
        return { 
          char: drawChar.char, 
          color: 'black', 
          backgroundColor: 'white', 
        }
      }
      return { 
        char: '', 
        backgroundColor: 'white'
      }
    }
  
    // when cursor is hovering non-empty cell ( clearly see cursor position eg. colored cell)
    if (coord.x == x && coord.y == y) { 
      return { 
        char: drawChar.char, 
        color: 'black', 
        backgroundColor: 'white', 
      }
    }
    // no-hovered non-empty cell rendering.
    return {
      char : u.char,
      color: u.color,
      backgroundColor: u.backgroundColor
    }
  }

}

export const boxStyle = {
  x               : 12,
  y               : 2,
	width           : 44,
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round',
}

const textStyle = {
  x               : 0,
  y               : 2,
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round', 
}


export function post(context, cursor, buffer) {

  const { rows, cols, settings: { generateData, generateBox, generateTextTitle, figlet } } =  context
  const textBoxStyle = {...boxStyle, ...generateBox.pos, ...generateBox.style}
  const titleBoxStyle = {...textStyle, ...generateTextTitle.pos, ...generateTextTitle.style}

  // console.log("figlet", figlet)
  // drawInfo(context, cursor, buffer, {
	// 	color : 'white', 
  //   backgroundColor : 'royalblue',
  //   x: 40,
	// })

  if (Object.keys(generateData).length === 0) return 

  let txt = Object.keys(generateData).reduce( (acc,curr) => { 
    if (["width", "height"].includes(curr)) return acc
    acc += curr + ' : ' + generateData[curr] + "\n" 
    return acc
  } , "")

  drawTextBox(figlet, titleBoxStyle, buffer, cols, rows)

  drawBox(txt, textBoxStyle, buffer, cols, rows)
}
