import textRenderer from './core/textrenderer.js'
import canvasRenderer from './core/canvasrenderer.js'
import FPS from './core/fps.js'
import storage from './core/storage.js'
import { clamp } from './modules/num.js';
import { borderStyles } from './modules/drawbox.js';
import { allColors } from './modules/color.js';
import { saveBlobAsFile } from './modules/filedownload.js'
import { clear } from './programs/draw.js';

const renderers = {
	'canvas' : canvasRenderer,
	'text'   : textRenderer
}

const defaultSettings = {
	element         : null,    // target element for output
	cols            : 0,       // number of columns, 0 is equivalent to 'auto'
	rows            : 0,       // number of columns, 0 is equivalent to 'auto'
	once            : false,   // if set to true the renderer will run only once
	fps             : 30,      // fps capping
	renderer        : 'text',  // can be 'canvas', anything else falls back to 'text'
	// allowSelect     : false,   // allows selection of the rendered element
	restoreState    : false,   // will store the "state" object in local storage
  drawChar        : { char: '#', hide: false }, // hide cursor when downloading.
  mode            : 'draw',
  figlet          : [""],      // ascii alphabets. 
  generateData    : { },
  generateBox  : { 
    pos: { x: 12, y: 42 }, 
    style: { 
      borderStyle: 'single', 
      color: 'black', 
      backgroundColor: 'white' 
    }
  },
  generateTextTitle  : { 
    pos: { x: 0, y: 0 }, 
    fontname: "Standard",
    style: { 
      borderStyle: 'none', 
      color: 'black', 
      backgroundColor: 'white' 
    }
  }
}

const CSSStyles = [
	'backgroundColor',
	'color',
	'fontFamily',
	'fontSize',
	'fontWeight',
	'letterSpacing',
	'lineHeight',
	'textAlign',
]

function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}

// lifecycle. 
// boot()  
// pre()  
// main() *this function is required* 
// post()
export function run(program, runSettings, userData = {}) {

	return new Promise(function(resolve) {
    
		const settings = {...JSON.parse(JSON.stringify(defaultSettings)), ...runSettings, ...program.settings}

		// for localStorage if settings.restoreState == true.
		const state = {
			time  : 0, // The time in ms
			frame : 0, // The frame number (int)
			cycle : 0  // An cycle count for debugging purposes
		}

		// Name of local storage key
		const LOCAL_STORAGE_KEY_STATE = 'currentState'

		if (settings.restoreState) {
			storage.restore(LOCAL_STORAGE_KEY_STATE, state)
			state.cycle++ // Keep track of the cycle count for debugging purposes
		}

		let renderer
		if (!settings.element) {
			renderer = renderers[settings.renderer] || renderers['text']
			settings.element = document.createElement(renderer.preferredElementNodeName)
			document.body.appendChild(settings.element)
		} else {
      if (settings.renderer == 'canvas') {
        if (settings.element.nodeName == 'CANVAS') {
          renderer = renderers[settings.renderer]
				} else {
					console.warn("This renderer expects a canvas target element.")
				}
			} else {
				if (settings.element.nodeName != 'CANVAS') {
					renderer = renderers[settings.renderer]
				} else {
					console.warn("This renderer expects a text target element.")
				}
			}
		}
		// Apply CSS settings to element
		for (const s of CSSStyles) {
			if (settings[s]) settings.element.style[s] = settings[s]
		}

		// Input pointer updated by DOM events
		const pointer = {
			x        : 0,
			y        : 0,
			pressed  : false,
			px       : 0,
			py       : 0,
			ppressed : false,
		}

		settings.element.addEventListener('pointermove', e => {
			const rect = settings.element.getBoundingClientRect()
			pointer.x = e.clientX - rect.left
			pointer.y = e.clientY - rect.top
		})

		settings.element.addEventListener('pointerdown', e => {
			pointer.pressed = true
		})

		settings.element.addEventListener('pointerup', e => {
			pointer.pressed = false
		})

    window.addEventListener('selectchar', e => {
      settings.drawChar.char = e.detail
    })

    window.addEventListener('resize-canvas', e => {
      const { w, h, fsize } = e.detail
      settings.element.style.fontSize = fsize
      settings.canvasSize = { width : w, height: h }
      let m = calcMetrics(settings.element)
      m._update(metrics)
    })

    window.addEventListener('clear-canvas', e => {
      clear()
      clearBuffer()
      settings.generateData = []
    })

    window.addEventListener('generate', e => {
      let metrics = calcMetrics(settings.element)
      settings.generateData = e.detail
      const rect = settings.element.getBoundingClientRect()
      const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
      const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)

      const x = Math.floor((Math.random() * cols)); 
      const y = Math.floor((Math.random() * rows));
      const pos =  { x: clamp(x, 0, 22) , y: clamp(y, 0, 48) }
      settings.generateBox.pos = pos
      settings.generateBox.style = {
        borderStyle: pickKey(borderStyles),
        color: allColors[Math.random() * allColors.length << 0].name, 
        backgroundColor: allColors[Math.random() * allColors.length << 0].name
      }

      figlet(e.detail.title, settings.generateTextTitle.fontname, function(err, text) {
        if (err) {
          console.log('something went wrong...');
          console.dir(err);
          return;
        }
        settings.figlet = text
      });

      const x2 = Math.floor((Math.random() * cols)); 
      const y2 = Math.floor((Math.random() * rows));
      const pos2 =  { x: clamp(x2, 0, 2) , y: clamp(y2, 0, 48) }
      settings.generateTextTitle.pos = pos2
      settings.generateTextTitle.style = {
        borderStyle: "none",
        color: "black", 
        backgroundColor: "white"
      }
    })

    window.addEventListener('reset', e => {
      settings.generateBox = JSON.parse(JSON.stringify(defaultSettings)).generateBox
      settings.generateTextTitle = JSON.parse(JSON.stringify(defaultSettings)).generateTextTitle
    })

    window.addEventListener('download', e => {
      const canvas = settings.element
      canvas.toBlob( blob => saveBlobAsFile(blob, 'export.png'))
    })

    window.addEventListener('fontselect', e => {
      settings.generateTextTitle.fontname = e.detail
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'e') { 
        settings.mode = 'erase'
        const el = document.getElementById("erase")
        const el1 = document.getElementById("drawTextColor")
        const el2 = document.getElementById("draw")
        const el3 = document.getElementById("drawBg")
        el1.removeAttribute("data-usage")
        el2.removeAttribute("data-usage")
        el3.removeAttribute("data-usage")
        el.setAttribute("data-usage", "erase")
      }

      if (e.key === 'd') { 
        settings.mode = 'draw'
        const el = document.getElementById("draw")
        const el1 = document.getElementById("drawTextColor")
        const el2 = document.getElementById("erase")
        const el3 = document.getElementById("drawBg")
        el1.removeAttribute("data-usage")
        el2.removeAttribute("data-usage")
        el3.removeAttribute("data-usage")
        el.setAttribute("data-usage", "draw")
      } 

      if (e.key === 'b') { 
        settings.mode = 'drawBg'
        const el = document.getElementById("drawBg")
        const el2 = document.getElementById("erase")
        const el3 = document.getElementById("draw")
        const el1 = document.getElementById("drawTextColor")
        el1.removeAttribute("data-usage")
        el2.removeAttribute("data-usage")
        el3.removeAttribute("data-usage")
        el.setAttribute("data-usage", "drawBg")
      } 

      if (e.key === 't') { 
        settings.mode = 'drawTextColor'
        const el = document.getElementById("drawTextColor")
        const el1 = document.getElementById("drawBg")
        const el2 = document.getElementById("erase")
        const el3 = document.getElementById("draw")
        el1.removeAttribute("data-usage")
        el2.removeAttribute("data-usage")
        el3.removeAttribute("data-usage")
        el.setAttribute("data-usage", "drawTextColor")
      } 
    })

		// CSS fix
		settings.element.style.fontStrech = 'normal'

		// Text selection may be annoing in case of interactive programs
		// if (!settings.allowSelect) disableSelect(settings.element)

    // kick in loop
		document.fonts.ready.then((e) => {
			let count = 3
			;(function __waitForFullyLoaded__() {
				if (--count > 0) {
					requestAnimationFrame(__waitForFullyLoaded__)
				} else {
					boot()
				}
			})()
		})

		const fps = new FPS()
		const EMPTY_CELL = ' '
		const DEFAULT_CELL_STYLE = Object.freeze({
			color           : settings.color,
			backgroundColor : settings.backgroundColor,
			fontWeight      : settings.fontWeight
		})

		const buffer = []
		let metrics

    function clearBuffer(){
      for (let i=0; i<buffer.length; i++) {
        buffer[i] = {...DEFAULT_CELL_STYLE, char : EMPTY_CELL}
      }
    }
    
		function boot() {
			metrics = calcMetrics(settings.element)
			const context = getContext(state, settings, metrics, fps)
			if (typeof program.boot == 'function') {
				program.boot(context, buffer, userData)
			}
			requestAnimationFrame(loop)
		}

		// Time sample to calculate precise offset
		let timeSample = 0
		const interval = 1000 / settings.fps
		const timeOffset = state.time

		// Used to track window resize
		let cols, rows

		function loop(t) {
			const delta = t - timeSample
			if (delta < interval) {
				if (!settings.once) requestAnimationFrame(loop)
				return
			}

			// Snapshot of context data
			const context = getContext(state, settings, metrics, fps)

			fps.update(t)

			// Timing update
			timeSample = t - delta % interval // adjust timeSample
			state.time = t + timeOffset       // increment time + initial offs
			state.frame++                     // increment frame counter
			storage.store(LOCAL_STORAGE_KEY_STATE, state) // store state

			// Cursor update
			const cursor = {
				          // The canvas might be slightly larger than the number
				          // of cols/rows, min is required!
				x       : Math.min(context.cols-1, pointer.x / metrics.cellWidth),
				y       : Math.min(context.rows-1, pointer.y / metrics.lineHeight),
				pressed : pointer.pressed,
				p : { // state of previous frame
					x       : pointer.px / metrics.cellWidth,
					y       : pointer.py / metrics.lineHeight,
					pressed : pointer.ppressed,
				}
			}

			// Pointer: store previous state
			pointer.px = pointer.x
			pointer.py = pointer.y
			pointer.ppressed = pointer.pressed

			// 1. --------------------------------------------------------------
			// In case of resize / init normalize the buffer
			if (cols != context.cols || rows != context.rows) {
				cols = context.cols
				rows = context.rows
				buffer.length = context.cols * context.rows
				for (let i=0; i<buffer.length; i++) {
					buffer[i] = {...DEFAULT_CELL_STYLE, char : EMPTY_CELL}
				}
			}

			// 2. --------------------------------------------------------------
			// Call pre(), if defined
			if (typeof program.pre == 'function') {
				program.pre(context, cursor, buffer, userData)
			}

			// 3. --------------------------------------------------------------
			// Call main(), if defined
			if (typeof program.main == 'function') {
				for (let j=0; j<context.rows; j++) {
					const offs = j * context.cols
					for (let i=0; i<context.cols; i++) {
						const idx = i + offs
						const out = program.main({x:i, y:j, index:idx}, context, cursor, buffer, userData)
						if (typeof out == 'object' && out !== null) {
							buffer[idx] = {...buffer[idx], ...out}
						} else {
							buffer[idx] = {...buffer[idx], char : out}
						}
						// handle undefined / null / etc.
						if (!Boolean(buffer[idx].char) && buffer[idx].char !== 0) {
							buffer[idx].char = EMPTY_CELL
						}
					}
				}
			}

			// 4. --------------------------------------------------------------
			// Call post(), if defined
			if (typeof program.post == 'function') {
				program.post(context, cursor, buffer, userData)
			}

			renderer.render(context, buffer, settings)
			if (!settings.once) requestAnimationFrame(loop)
			resolve(context)
		}
	})
}

// -- Helpers ------------------------------------------------------------------

// Build / update the 'context' object (immutable)
function getContext(state, settings, metrics, fps) {
	const rect = settings.element.getBoundingClientRect()
	const cols = settings.cols || Math.floor(rect.width / metrics.cellWidth)
	const rows = settings.rows || Math.floor(rect.height / metrics.lineHeight)
	return Object.freeze({
		frame : state.frame,
		time : state.time,
		cols,
		rows,
		metrics,
		width : rect.width,
		height : rect.height,
		settings,
		// Runtime & debug data
		runtime : Object.freeze({
			cycle : state.cycle,
			fps : fps.fps
		})
	})
}

// Disables selection for an HTML element
// function disableSelect(el) {
// 	el.style.userSelect = 'none'
// 	el.style.webkitUserSelect = 'none' // for Safari on mac and iOS
// 	el.style.mozUserSelect = 'none'    // for mobile FF
// 	el.dataset.selectionEnabled = 'false'
// }

export function calcMetrics(el) {

	const style = getComputedStyle(el)
	const fontFamily = style.getPropertyValue('font-family')
	const fontSize   = parseFloat(style.getPropertyValue('font-size'))
	// https://bugs.webkit.org/show_bug.cgi?id=225695
	const lineHeight = parseFloat(style.getPropertyValue('line-height'))
	let cellWidth

	if (el.nodeName == 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
		cellWidth = ctx.measureText(''.padEnd(50, '╳')).width / 50
	} else {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(50, '╳')
		cellWidth = span.getBoundingClientRect().width / 50
		el.removeChild(span)
	}

	const metrics = {
		aspect : cellWidth / lineHeight,
		cellWidth,
		lineHeight,
		fontFamily,
		fontSize,
		// // allow an update of the metrics object.
		_update : function(m) {
			const tmp = calcMetrics(el)
			for(var k in tmp) {
				if (typeof tmp[k] == 'number' || typeof tmp[k] == 'string') {
					m[k] = tmp[k]
				}
			}
		}
	}
	return metrics
}