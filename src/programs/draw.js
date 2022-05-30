import { drawBox, drawInfo } from '/src/modules/drawbox.js'
import { drawTextBox } from '/src/modules/drawtext.js'
import { clamp } from '/src/modules/num.js';

export const settings = { 
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

const data = []
let buff = []
let prevPos = []
let cols, rows
let fig = []


// width = context.metrics.cellWidth * context.rows

const textStyle = {
  x               : 0,
  y               : 2,
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round', 
}

export function clear(){
  data.fill({char: '', backgroundColor: "white", color: "black"})
}

export function pre(context, cursor, buffer) {
  const { settings: { drawChar, mode, generateTextTitle, figlet } } =  context
  const titleBoxStyle = {...textStyle, ...generateTextTitle.pos, ...generateTextTitle.style}
  // const { settings: { drawChar, mode  }} = context

  // draw FIGlet font first (so the cursor can be positioned above)
  if (figlet != fig) {
    fig = figlet
    buff.length = (69 * figlet.length)
    for (let i=0; i<buff.length; i++) { buff[i] = data[i] } // fill temp buff avoid undefined
    drawTextBox(figlet, { ...titleBoxStyle, x:0, y:0 }, buff, cols, rows)
    for (let x=0; x<buff.length; x++) { data[x + (titleBoxStyle.x + titleBoxStyle.y * cols)] = buff[x] } // push new FIGlet font pos
    for (let i=0;i<prevPos.length;i++){ data[prevPos[i]] = {char: '', color: "black", backgroundColor: "white"} } // clear old position: ;
    prevPos = []
    for (let x=0; x<buff.length; x++) { prevPos.push(x + (titleBoxStyle.x + titleBoxStyle.y * 69)) } // then push new positions to array
  }

	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
    data.push(...buffer)
	}
  
	if (cursor.pressed) {
    const x = Math.floor(cursor.x) 
    const y = Math.floor(cursor.y)
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

  if (coord.x  == x && coord.y == y - 1 ) return ''
  if (coord.x  == x && coord.y == y + 1 ) return ''
  if (coord.y  == y && coord.x == x + 1 ) return ''
  if (coord.y  == y && coord.x == x - 1 ) return ''
  if (coord.x == x && coord.y == y) return drawChar.char
	if (coord.x == x) return ':'
	if (coord.y == y) return '·'
	
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



export function post(context, cursor, buffer) {

  const { rows, cols, settings: { generateData, generateBox, generateTextTitle, figlet } } =  context
  const textBoxStyle = {...boxStyle, ...generateBox.pos, ...generateBox.style}
  // const titleBoxStyle = {...textStyle, ...generateTextTitle.pos, ...generateTextTitle.style}

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

  // drawTextBox(figlet, titleBoxStyle, buffer, cols, rows)

  drawBox(txt, textBoxStyle, buffer, cols, rows)
}
