import textRenderer from '../core/textrenderer.js'
import canvasRenderer from '../core/canvasrenderer.js'

export const renderers = {
	'canvas' : canvasRenderer,
	'text'   : textRenderer
}

const optionsDefault = {
  cursorMode: { status: "guide", index: 0, target: "cursor-type"},
  grid: { status: "show", index: 0, target: "grid-status"},
  canvas: { status: "white", index: 0, target: "canvas-fill-status"},
  control: { status: "mouse", index: 0, target: "control-status"},
}

export const defaultSettings = {
	element         : null,    // target element for output
	cols            : 0,       // number of columns, 0 is equivalent to 'auto'
	rows            : 0,       // number of columns, 0 is equivalent to 'auto'
	once            : false,   // if set to true the renderer will run only once
	fps             : 30,      // fps capping
	renderer        : "text",  
  cursorBrush     : { char: '#' },
  mode            : { cmd: "normal", options: optionsDefault, meta: false},
  figlet          : [""],      // ascii alphabets. 
  generateData    : { },
  canvasFill      : "white",
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
	// 'textAlign',
]

export const canvasFillStyle = {
  white: { 
    color: "black", 
    backgroundColor: "white", 
  },
  black: {
    color : "white",
    backgroundColor : "black",
  }  
}