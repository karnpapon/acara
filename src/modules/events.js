import { clamp } from "./num.js";
import { borderStyles } from "./drawbox.js";
import { allColors } from "./color.js";
import { saveBlobAsFile } from "./filedownload.js"
import { clear } from "../programs/draw.js";
import { defaultSettings, themeStyle } from "./setting.js";
import { calcMetrics } from "./utils.js";

const cmdlist = {
  d: { main: "draw", subcmd: undefined, index: 0},
  c: { main: "cursorMode", subcmd: "guide", index: 0},
  g: { main: "grid", subcmd: "show", index: 0},
  e: { main: "erase", subcmd: undefined, index: 0},
  t: { main: "theme", subcmd: "light", index: 0}
}

function pickKey(obj){
  var keys = Object.keys(obj);
  return keys[ keys.length * Math.random() << 0];
}

function setSubCmd(c, settings){
  if(c["main"] === "cursorMode") { 
    const cursorType = document.getElementById("cursor-type")
    const _subcmd = ["guide", "normal", "none" ]
    settings.mode.index = (settings.mode.index += 1) % _subcmd.length
    cursorType.innerText = _subcmd[settings.mode.index]
    settings.mode.subcmd = _subcmd[settings.mode.index]
    return 
  } 

  if(c["main"] === "grid") { 
    const gridStatus = document.getElementById("grid-status")
    const gridElem = document.getElementsByClassName("grid-overlay")[0]
    gridElem.classList.toggle("hide")
    const _subcmd = ["show", "hide" ]
    settings.mode.index = (settings.mode.index += 1) % _subcmd.length
    const mode = _subcmd[settings.mode.index]
    gridStatus.innerText = mode
    settings.mode.subcmd = mode
    return 
  } 

  if(c["main"] === "theme") { 
    const textColor = document.getElementById("text-color");
    const bgColor = document.getElementById("bg-color");
    textColor.style.backgroundColor = themeStyle[settings.theme].backgroundColor
    bgColor.style.backgroundColor = themeStyle[settings.theme].color

    settings.color = themeStyle[settings.theme].backgroundColor
    settings.backgroundColor = themeStyle[settings.theme].color

    const themeStatus = document.getElementById("theme-status")
    const _subcmd = ["light", "dark" ]
    settings.mode.index = (settings.mode.index += 1) % _subcmd.length
    const mode = _subcmd[settings.mode.index]
    themeStatus.innerText = mode
    settings.mode.subcmd = mode
    settings.theme = mode

    
    return 
  } 

  settings.mode.main = c["main"]
}

function command(e, settings) {
  const c = cmdlist[e.key]

  if(!c) return

  setSubCmd(c, settings)
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