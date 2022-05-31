// import textRenderer from './core/textrenderer.js'
// import canvasRenderer from './core/canvasrenderer.js'
import FPS from './core/fps.js'
import storage from './core/storage.js'
import { listen } from './modules/events.js'
import { getContext, calcMetrics } from "./modules/utils.js";
import { renderers, defaultSettings, CSSStyles} from "./modules/setting.js";


// lifecycle. 
// boot()  --> pre()  --> main() *this function is required* -> post()
export function run(program, runSettings, userData = {}) {

	return new Promise(function(resolve) {
    
		const settings = {...JSON.parse(JSON.stringify(defaultSettings)), ...runSettings, ...program.settings}

		const pointer = {
			x        : 0,
			y        : 0,
			pressed  : false,
			px       : 0,
			py       : 0,
			ppressed : false,
		}

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

    let metrics = calcMetrics(settings.element)

    // event listening
    listen(settings, pointer, metrics)

		// CSS fix
		settings.element.style.fontStrech = 'normal'

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
		const EMPTY_CELL = ''
		const DEFAULT_CELL_STYLE = Object.freeze({
			color           : settings.color,
			backgroundColor : settings.backgroundColor,
			fontWeight      : settings.fontWeight
		})

		const buffer = []
		
		function boot() {
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