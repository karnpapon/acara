import { clamp } from "./num.js";
import { borderStyles } from "./drawbox.js";
import { allColors } from "./color.js";
import { saveBlobAsFile, saveSourceAsFile } from "./filedownload.js"
import { clear, getData, getCols, getRows } from "../programs/draw.js";
import { defaultSettings, canvasFillStyle } from "./setting.js";
import { calcMetrics, pickKey } from "./utils.js";

const cmdlist = {
  d: { cmd: "draw", options: undefined, target: undefined},
  c: { cmd: "cursorMode", options: ["guide", "normal", "pattern", "none" ], target: "cursor-type"},
  g: { cmd: "grid", options: ["show", "hide" ], target: "grid-status"},
  e: { cmd: "erase", options: undefined, target: undefined},
  k: { cmd: "canvas", options: ["white", "black" ], target: "canvas-fill-status"},
  j: { cmd: "generator", options: undefined, target: undefined},
  p: { cmd: "pattern", options: undefined, target: undefined}
}

function setoptions(c, settings){
  const option = c.options[settings.mode.options[c["cmd"]].index]
  settings.mode.options[c["cmd"]].index = (settings.mode.options[c["cmd"]].index += 1) % c.options.length
  settings.mode.options[c["cmd"]].status = option

  const optionBadge = document.getElementById(c.target)
  optionBadge.innerText = option

  if(c["cmd"] === "grid" && settings.id === "draw_canvas") { 
    const drawCanvasElem = document.getElementsByClassName("grid-canvas-width")[0]
    const patternCanvasElem = document.getElementsByClassName("grid-pattern-width")[0]
    if(settings.id === "draw_canvas") { drawCanvasElem.classList.toggle("hide") }
    if(settings.id === "pattern_canvas") { patternCanvasElem.classList.toggle("hide") }
  } 

  if(c["cmd"] === "canvas") { 
    const textColor = document.getElementById("text-color");
    const bgColor = document.getElementById("bg-color");

    const currentChar = document.getElementById("current-char");
    const currentCharBg = document.getElementById("current-char-status");

    textColor.style.backgroundColor = canvasFillStyle[optionBadge.innerText].color
    bgColor.style.backgroundColor = canvasFillStyle[optionBadge.innerText].backgroundColor
    
    settings.color = canvasFillStyle[settings.canvasFill].backgroundColor
    settings.backgroundColor = canvasFillStyle[settings.canvasFill].color
    settings.canvasFill = option

    // repaint pattern-canvas
    if(settings.id === "pattern_canvas") { 
      window.acara.pattern.forEach(p => { 
        p.color = canvasFillStyle[settings.canvasFill].color
        p.backgroundColor = canvasFillStyle[settings.canvasFill].backgroundColor
      })
    }

    currentChar.style.color = canvasFillStyle[settings.canvasFill].color 
    currentCharBg.style.backgroundColor = canvasFillStyle[settings.canvasFill].backgroundColor; 
  }  
}

function command(e, settings) {
  const c = cmdlist[e.key]
  if(!c) return
  if(c.target) { 
    setoptions(c, settings) 
  } else {
    settings.mode.cmd = c["cmd"]

    if(c["cmd"] === "generator" && settings.id === "draw_canvas") { 
      const form = document.getElementById("generator-form");
      form.classList.toggle("collapse"); 
    }

    if(c["cmd"] === "pattern" && settings.id === "pattern_canvas") { 
      const form = document.getElementById("pattern-form");
      form.classList.toggle("collapse"); 
    }
  }
  
  const el = document.getElementById(c["cmd"])
  const rest = document.querySelector("[data-usage]")
  rest.removeAttribute("data-usage")
  el.setAttribute("data-usage", c["cmd"])
}

export function listen(settings, pointer, metrics) {

  settings.element.addEventListener('pointermove', e => {
    const rect = settings.element.getBoundingClientRect()
    let _x = ( e.clientX  - rect.left )
    let _y = ( e.clientY  - rect.top )

    // if(settings.id === "draw_canvas" && settings.mode.options.cursorMode.status === "pattern") { 
    //   let tempX = Math.floor((_x) / metrics.cellWidth) % 8
    //   let tempY = Math.floor((_y) / metrics.lineHeight) % 4
    //   if (tempX !== 0 || tempY !== 0) return
    //   pointer.x = _x
    //   pointer.y = _y
    // } else {
    pointer.x = _x
    pointer.y = _y
    // }
  })

  settings.element.addEventListener('pointerdown', e => {
    pointer.pressed = true
  })

  settings.element.addEventListener('pointerup', e => {
    pointer.pressed = false
  })

  window.addEventListener('selectchar', e => {
    settings.cursorBrush.char = e.detail
  })

  window.addEventListener('select-text-color', e => {
    settings.color = e.detail.color
  })

  window.addEventListener('select-bg-color', e => {
    settings.backgroundColor = e.detail.color
  })

  window.addEventListener('resize-canvas', e => {
    const { w, h, fsize } = e.detail
    settings.element.style.fontSize = fsize
    settings.canvasSize = { width : w, height: h }
    let m = calcMetrics(settings.element)
    const gridEle = document.getElementsByClassName("grid-overlay")[0]
    m._update(metrics)
    gridEle.style.width =`${w}px`
    gridEle.style.height = `${h}px`
    gridEle.style.backgroundSize = `${m.cellWidth}px ${m.cellHeight}px`
  })

  window.addEventListener('clear-canvas', e => {
    clear()
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
    if(settings.id === "pattern_canvas") return 
    const filetype = document.getElementById("download-filetype").value
    if(filetype === "img") {
      const canvas = settings.element
      canvas.toBlob( blob => saveBlobAsFile(blob, 'export.png'))
    } else if(filetype === "txt") {
      const cols = getCols()
      const rows = getRows()
      const txt = getData()
      let acc = "", ii = 0
      for(let x=0; x<=cols; x++) {
        for(let y=0;y<=rows; y++){
          const curr = txt[ii].char
          if (ii % (cols) === 0) { acc += "\n" }
          if(hasWhiteSpace(curr) || curr === undefined) { 
            acc +=  " " 
          } else { 
            acc += curr 
          }
          ii++
        }
      }
      saveSourceAsFile(acc, 'export.txt')
    }
  })

  window.addEventListener('fontselect', e => {
    settings.generateTextTitle.fontname = e.detail
  })

  document.addEventListener('keydown', e => {
    if (document.activeElement.tagName === "INPUT") return
    command(e, settings)
  })
}

function hasWhiteSpace(c) {
  return c === ' '
      || c === ''
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