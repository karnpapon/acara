export const settings = { 
  fps : 30, 	
  // renderer : 'canvas',
  // canvasOffset : {
  //   x : 'auto',
  //   y : 20
  // },
  // canvasSize : {
  //   width : 400,
  //   height : 500
  // },
  // cols : 64,
  // rows : 22,
  // backgroundColor : 'pink',
  color : 'green'
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
		data.length = cols * rows
		data.fill({ char: 0, color: 'black', backgroundColor: 'white'})
	}

	if (cursor.pressed) {
		data[x + y * cols] = mode === "erase" ? {char: 0, color: 'black', backgroundColor: 'white'} : { char: drawChar, color: mode === 'drawTextColor' ?  'red' : data[x + y * cols]["color"], backgroundColor: mode === 'drawBg' ? 'lightblue' : data[x + y * cols]["backgroundColor"] }
	} 
	
}

export function main(coord, context, cursor, buffer) {
  const { settings: { drawChar, mode }} = context
	const x = Math.floor(cursor.x) 
	const y = Math.floor(cursor.y) 
	
	const u = data[coord.index]

	if (u.char === 0) { 
    if (coord.x == x && coord.y == y) { 
      return { 
        char: drawChar, 
        color: 'green', 
        backgroundColor: mode === "erase" ? 'yellow' : 'lightgreen'
      }
    }
    return { 
      char: '', 
      backgroundColor: 'white'
    }
	}
	if (coord.x == x && coord.y == y) { 
    return { 
      char: drawChar, 
      color: 'green', 
      backgroundColor: mode === "erase" ? 'yellow' : 'lightgreen'
    }
  }
	return {
		char : u.char,
    color: u.color,
		backgroundColor: u.backgroundColor
	}
}

// import { drawInfo } from '/src/modules/drawbox.js'
// export function post(context, cursor, buffer) {
// 	drawInfo(context, cursor, buffer, {
// 		color : 'white', 
//     backgroundColor : 'royalblue',
//     borderStyle     : 'none',
// 	})
// }
