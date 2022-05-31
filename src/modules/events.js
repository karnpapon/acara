import { clamp } from "./num.js";
import { borderStyles } from "./drawbox.js";
import { allColors } from "./color.js";
import { saveBlobAsFile } from "./filedownload.js"
import { clear } from "../programs/draw.js";
import { defaultSettings } from "./setting.js";
import { calcMetrics } from "./utils.js";

let subCmdIndex = 0

const cmdlist = {
  d: { main: "draw", subcmd: undefined},
  t: { main: "drawTextColor", subcmd: undefined},
  b: { main: "drawBg", subcmd: undefined},
  c: { main: "cursorMode", subcmd: undefined},
  e: { main: "erase", subcmd: undefined}
}

function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}

function setSubCmd(c, settings){
  if(c["main"] !== "cursorMode") { 
    const cursorType = document.getElementById("cursor-type")
    cursorType.innerText = "normal"
    subCmdIndex = 0
    settings.mode.subcmd = undefined
    return 
  } 

  const cursorType = document.getElementById("cursor-type")
  const _subcmd = ["normal", "guide", "none" ]
  cursorType.innerText = _subcmd[subCmdIndex]
  settings.mode.subcmd = _subcmd[subCmdIndex]
  subCmdIndex = (subCmdIndex += 1) % _subcmd.length
}

function command(e, settings) {
  const c = cmdlist[e.key]

  if(!c) return

  setSubCmd(c, settings)

  settings.mode = c 
  const el = document.getElementById(c["main"])
  const rest = document.querySelector("[data-usage]")
  rest.removeAttribute("data-usage")
  el.setAttribute("data-usage", c["main"])
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

  window.addEventListener('resize-canvas', e => {
    const { w, h, fsize } = e.detail
    settings.element.style.fontSize = fsize
    settings.canvasSize = { width : w, height: h }
    let m = calcMetrics(settings.element)
    m._update(metrics)
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
    canvas.toBlob( blob => saveBlobAsFile(blob, 'export.png'))
  })

  window.addEventListener('fontselect', e => {
    settings.generateTextTitle.fontname = e.detail
  })

  document.addEventListener('keydown', e => {
    command(e, settings)
  })
}