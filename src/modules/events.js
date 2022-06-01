import { clamp } from "./num.js";
import { borderStyles } from "./drawbox.js";
import { allColors } from "./color.js";
import { saveBlobAsFile } from "./filedownload.js"
import { clear } from "../programs/draw.js";
import { defaultSettings, canvasFillStyle } from "./setting.js";
import { calcMetrics } from "./utils.js";

const cmdlist = {
  d: { cmd: "draw", options: undefined, index: 0, target: undefined},
  c: { cmd: "cursorMode", options: ["guide", "normal", "none" ], index: 0, target: "cursor-type"},
  g: { cmd: "grid", options: ["show", "hide" ], index: 0, target: "grid-status"},
  e: { cmd: "erase", options: undefined, index: 0, target: undefined},
  k: { cmd: "canvas", options: ["white", "black" ], index: 0, target: "canvas-fill-status"},
  j: { cmd: "generator", options: undefined, index: 0, target: undefined}
}

function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}

function setoptions(c, settings){
  const option = c.options[settings.mode.options[c["cmd"]].index]
  settings.mode.options[c["cmd"]].index = (settings.mode.options[c["cmd"]].index += 1) % c.options.length
  settings.mode.options[c["cmd"]].status = option

  const optionBadge = document.getElementById(c.target)
  optionBadge.innerText = option

  if(c["cmd"] === "grid") { 
    const gridElem = document.getElementsByClassName("grid-overlay")[0]
    gridElem.classList.toggle("hide")
  } 

  if(c["cmd"] === "canvas") { 
    const textColor = document.getElementById("text-color");
    const bgColor = document.getElementById("bg-color");
    textColor.style.backgroundColor = canvasFillStyle[settings.canvasFill].backgroundColor
    bgColor.style.backgroundColor = canvasFillStyle[settings.canvasFill].color
    settings.color = canvasFillStyle[settings.canvasFill].backgroundColor
    settings.backgroundColor = canvasFillStyle[settings.canvasFill].color
    settings.canvasFill = option
  }  
}

function command(e, settings) {
  const c = cmdlist[e.key]
  if(!c) return
  if(c.target) { 
    setoptions(c, settings) 
  } else {
    settings.mode.cmd = c["cmd"]

    if(c["cmd"] === "generator") { 
      const form = document.getElementById("generator-form");
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
    const canvas = settings.element
    // const w = (settings.canvasSize.width * 2).toString() + 'px';
    // const h = (settings.canvasSize.height * 2).toString() + 'px';
    // canvas.style.width = w
    // canvas.style.height = h
    canvas.toBlob( blob => saveBlobAsFile(blob, 'export.png'))
  })

  window.addEventListener('fontselect', e => {
    settings.generateTextTitle.fontname = e.detail
  })

  document.addEventListener('keydown', e => {
    if (document.activeElement.tagName === "INPUT") return
    command(e, settings)
  })
}