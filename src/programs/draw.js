import { drawBox } from '/src/modules/drawbox.js'
import { drawTextBox } from '/src/modules/drawtext.js'

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

const data = []
let buff = []
let prevPos = []
let cols, rows
let fig = []

const textStyle = {
  x               : 0,
  y               : 2,
	backgroundColor : 'white',
	color           : 'black',
	fontWeight      : 'normal',
	shadowStyle     : 'none',
	borderStyle     : 'round', 
}

function hasWhiteSpace(c) {
  return c === ' '
      || c === ''
      || c === '\n'
      || c === '\t'
      || c === '\r'
      || c === '\f'
      || c === '\v'
      || c === '\u00a0'
      || c === '\u1680'
      || c === '\u2000'
      || c === '\u200a'
      || c === '\u2028'
      || c === '\u2029'
      || c === '\u202f'
      || c === '\u205f'
      || c === '\u3000'
      || c === '\ufeff'
}

export function clear(){
  data.fill({char: '', backgroundColor: "white", color: "black"})
}

export function pre(context, cursor, buffer) {
  const { settings: { drawChar, mode, generateTextTitle, figlet, color, backgroundColor } } =  context
  const titleBoxStyle = {...textStyle, ...generateTextTitle.pos, ...generateTextTitle.style}

  // draw FIGlet font first (so the cursor can be positioned above)
  if (cols && figlet != fig) {
    buff.length = (cols * figlet.length)

    for (let i=0; i<buff.length; i++) { 
      buff[i] = { char: "", color: "black", backgroundColor: "white"} 
    } // fill temp buff avoid undefined

    drawTextBox(figlet, { ...titleBoxStyle, x:0, y:0 }, buff, cols, rows)

    if(prevPos.length > 0){
      for (let i=0;i<prevPos.length;i++){ 
        if (buff[i] && !hasWhiteSpace(buff[i].char) ) {
          data[prevPos[i]] = {char: "", color: "black", backgroundColor: "white"} 
        }
      } // clear old position;
      prevPos = []
    }

    for (let x=0; x<buff.length; x++) { 
      if (buff[x] && buff[x].char !== " " ) {
        data[x + (titleBoxStyle.x + titleBoxStyle.y * cols)] = buff[x] 
      }
    } // push new FIGlet font pos

    for (let x=0; x<buff.length; x++) { 
      prevPos.push(x + (titleBoxStyle.x + titleBoxStyle.y * cols)) 
    } // then push new positions to array
   
    fig = figlet
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
      const newChar = mode.main === "erase" ? {char: '', color: 'black', backgroundColor: 'white'} : { char: drawChar.char, color, backgroundColor }
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

      // cursor mode
  if (coord.x == x && coord.y == y && mode.subcmd === "none") return ''
  if (coord.x == x && coord.y == y) return { char: drawChar.char, color: 'black' }
  if(mode.subcmd === "guide") {
    // if (coord.x  == x && coord.y == y - 1 ) return ''
    // if (coord.x  == x && coord.y == y + 1 ) return ''
    // if (coord.y  == y && coord.x == x + 1 ) return ''
    // if (coord.y  == y && coord.x == x - 1 ) return ''
    if (coord.x == x) return { char: '·', color: 'gray' }
    if (coord.y == y) return { char: '·', color: 'gray' }
  }

      if (coord.x == x && coord.y == y) { 
        return { 
          char: drawChar.char, 
          color: 'black', 
          backgroundColor: 'white', 
        }
      }
      return { 
        char: '', 
        color: 'black', 
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

export function post(context, cursor, buffer) {

  const { rows, cols, settings: { generateData, generateBox } } =  context
  const textBoxStyle = {...boxStyle, ...generateBox.pos, ...generateBox.style}

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

  drawBox(txt, textBoxStyle, buffer, cols, rows)
}
