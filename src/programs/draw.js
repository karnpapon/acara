import { drawBox } from '/src/modules/drawbox.js'
import { drawTextBox } from '/src/modules/drawtext.js'
import { canvasFillStyle } from "/src/modules/setting.js"

export const settings = { 
  id : "draw_canvas",
  fps : 30, 	
  eventListener: { 
    generator: true, 
    draw: true, 
    erase: true, 
    grid: true,
    control: true,
    canvas: true,
    download: true,
    export: true,
    meta: true
  },
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

export function getData(){ return data} 
export function getCols(){ return cols}
export function getRows(){ return rows}

export function clear(){
  data.fill({char: '', backgroundColor: "white", color: "black"})
}

export function pre(context, cursor, buffer) {
  const { settings: { cursorBrush, mode, generateTextTitle, figlet, color, backgroundColor } } =  context
  const titleBoxStyle = {...textStyle, ...generateTextTitle.pos, ...generateTextTitle.style}

  if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
		data.length = cols * rows 
		data.fill({char: '', color: "black", backgroundColor: "white"})
	}

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
  
	if (cursor.pressed) {
    const x = Math.floor(cursor.x) 
    const y = Math.floor(cursor.y)
    if(data[x + y * cols]) {
      if(mode.options.cursorMode.status === "pattern") {
        let i=0;
        for (let px=x; px<(x+window.acara.patternSize.cols); px++) {
          let j=0;
          for (let py=y; py<(y+window.acara.patternSize.rows); py++) {
            data[px + py * cols] = window.acara.pattern[i+j*10] 
            j++
          }
          i++
        }

      } else {
        const newChar = mode.cmd === "erase" ? {char: '', color: 'black', backgroundColor: 'white'} : { char: cursorBrush.char, color, backgroundColor }
        data[x + y * cols] = newChar      
      } 
    }
	} 
}

export function main(coord, context, cursor, buffer) {
  const { settings: { cursorBrush, mode, canvasFill, backgroundColor, color }} = context
	const x = Math.floor(cursor.x) 
	const y = Math.floor(cursor.y) 

  if(mode.options.cursorMode.status === "pattern") {
    for (let px=0; px<window.acara.patternSize.cols; px++) {
      for (let py=0; py<window.acara.patternSize.rows; py++) {
        const cell = window.acara.pattern[px+py*10]
        if ( coord.x  == x + px && coord.y == y + py || 
          coord.x  == x + px && coord.y == y + py) {
          return {
            char: cell.char, 
            color: cell.color, 
            backgroundColor: cell.backgroundColor 
          }
        } 
      }
    }
  }

  if(data[coord.index]) {
    const u = data[coord.index]
  
    // determine rendering empty cells (and when cursor is hovering these).
    if (u.char === '') { 
      // cursor mode
      if (mode.options.cursorMode.status === "none") return ''

      if (coord.x == x && coord.y == y) {
        return {
          char: cursorBrush.char, 
          color: color,
          backgroundColor: backgroundColor
        }
      }

      if(mode.options.cursorMode.status === "guide") {
        if ( coord.x  == x && coord.y == y - 1 ||
          coord.x  == x && coord.y == y + 1 ||
          coord.y  == y && coord.x == x + 1 ||
          coord.y  == y && coord.x == x - 1 ) {
          return { 
            char: '', 
            color: 'gray', 
            backgroundColor: canvasFillStyle[canvasFill].backgroundColor 
          }
        } 

        if (coord.x == x) return { char: '·', color: 'gray', backgroundColor: canvasFillStyle[canvasFill].backgroundColor }
        if (coord.y == y) return { char: '·', color: 'gray', backgroundColor: canvasFillStyle[canvasFill].backgroundColor }
      }

      return { 
        char: '', 
        color: canvasFillStyle[canvasFill].color,
        backgroundColor: canvasFillStyle[canvasFill].backgroundColor,
      }
    }

    // when cursor is hovering non-empty cell ( clearly see cursor position eg. colored cell)
    // this is a repeated code, but it's necessary. 
    // otherwise current cursor letter (cursorBrush) will disappear when hovering at cell that already have a letter.
    if (coord.x == x && coord.y == y) {
      return {
        char: cursorBrush.char, 
        color: backgroundColor,
        backgroundColor: color
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

  if (Object.keys(generateData).length === 0) return 

  let txt = Object.keys(generateData).reduce( (acc,curr) => { 
    if (["width", "height"].includes(curr)) return acc
    acc += curr + ' : ' + generateData[curr] + "\n" 
    return acc
  } , "")

  drawBox(txt, textBoxStyle, buffer, cols, rows)
}
