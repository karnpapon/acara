import textRenderer from '../core/textrenderer.js'
import canvasRenderer from '../core/canvasrenderer.js'

export const renderers = {
	'canvas' : canvasRenderer,
	'text'   : textRenderer
}

export const defaultSettings = {
	element         : null,    // target element for output
	cols            : 0,       // number of columns, 0 is equivalent to 'auto'
	rows            : 0,       // number of columns, 0 is equivalent to 'auto'
	once            : false,   // if set to true the renderer will run only once
	fps             : 30,      // fps capping
	renderer        : "text",  // can be 'canvas', anything else falls back to 'text'
	restoreState    : false,   // will store the "state" object in local storage
  drawChar        : { char: '#', hide: false }, // hide cursor when downloading.
  mode            : { main: "normal", subcmd: "guide"},
  figlet          : [""],      // ascii alphabets. 
  generateData    : { },
  generateBox  : { 
    pos: { x: 12, y: 42 }, 
    style: { 
      borderStyle: "single", 
      color: "black", 
      backgroundColor: "white" 
    }
  },
  generateTextTitle  : { 
    pos: { x: 0, y: 0 }, 
    fontname: "Standard",
    style: { 
      borderStyle: "none", 
      color: "black", 
      backgroundColor: "white" 
    }
  }
}

export const CSSStyles = [
	'backgroundColor',
	'color',
	'fontFamily',
	'fontSize',
	'fontWeight',
	'letterSpacing',
	'lineHeight',
	'textAlign',
]