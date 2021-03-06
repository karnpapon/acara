import { clamp } from "./num.js";
import { borderStyles } from "./drawbox.js";
import { allColors } from "./color.js";
import { saveBlobAsFile, saveSourceAsFile } from "./filedownload.js"
import { clear, getData, pushData, getCols, getRows } from "../programs/draw.js";
import { defaultSettings, canvasFillStyle } from "./setting.js";
import { calcMetrics, pickKey } from "./utils.js";

const cmdlist = {
  d: { cmd: "draw", options: undefined, target: undefined},
  c: { cmd: "cursorMode", options: ["guide", "normal", "pattern", "none" ], target: "cursor-type"},
  g: { cmd: "grid", options: ["show", "hide" ], target: "grid-status"},
  e: { cmd: "erase", options: undefined, target: undefined},
  k: { cmd: "canvas", options: ["white", "black" ], target: "canvas-fill-status"},
  n: { cmd: "control", options: ["mouse", "keyboard"], target: "control-status"},
  j: { cmd: "generator", options: undefined, target: undefined},
  p: { cmd: "pattern", options: undefined, target: undefined},
  x: { cmd: "export", options: undefined, target: undefined},
}

const _listener = (el, method, types, fn) => types.split(/\s+/).forEach(type => el[method](type, fn));
const on = (el, types, fn) => _listener(el, 'addEventListener', types, fn);
const off = (el, types, fn) => _listener(el, 'removeEventListener', types, fn);

function setoptions(c, settings){
  const isEventAllowed = settings.eventListener[c["cmd"]] ?? false
  const option = c.options[settings.mode.options[c["cmd"]].index]
  settings.mode.options[c["cmd"]].index = (settings.mode.options[c["cmd"]].index += 1) % c.options.length
  settings.mode.options[c["cmd"]].status = option

  const optionBadge = document.getElementById(c.target)
  optionBadge.innerText = option

  if(isEventAllowed){
    if(c["cmd"] === "control") {
      if(option === "keyboard") { 
        document.getElementById("control-detail-box").classList.remove("collapse");
      } else if (option === "mouse") {
        document.getElementById("control-detail-box").classList.add("collapse");
      }
    }
  
    // affect only draw_canvas (based on settings.eventListener)
    if(c["cmd"] === "grid") { 
      document.getElementsByClassName("grid-canvas-width")[0].classList.toggle("hide") 
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
  
      // repaint
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
}

function setcommand(e, settings, pointer) {
  const c = cmdlist[e.key]
  if(!c) return
  
  const cmd = c["cmd"]
  const el = document.getElementById(cmd)
  const rest = document.querySelector("[data-usage]")
  rest.removeAttribute("data-usage")
  el.setAttribute("data-usage", cmd)
  settings.mode.cmd = cmd

  if(c.target) { setoptions(c, settings); return } 

  const isEventAllowed = settings.eventListener[cmd] ?? false

  if(isEventAllowed) {
    if(cmd === "generator") { 
      document.getElementById("generator-form").classList.toggle("collapse");
    }
  
    if(cmd === "pattern") { 
      document.getElementById("pattern-form").classList.toggle("collapse");
    }


    if(c["cmd"] === "export") { 
      document.getElementsByClassName("download-group")[0].classList.toggle("collapse") 
    } 
  
    if (settings.mode.options.control.status === "keyboard"){
      if(cmd === "draw" ) { pointer.pressed = true }
      if(cmd === "erase") { pointer.pressed = true }
    }
  }
}

export function listen(settings, pointer, metrics) {

  on(settings.element, 'pointermove', e => {
    if(settings.id === "draw_canvas" && settings.mode.options.control.status === "keyboard") return
    const rect = settings.element.getBoundingClientRect()
    let _x = ( e.clientX  - rect.left )
    let _y = ( e.clientY  - rect.top )
    pointer.x = _x
    pointer.y = _y
  })
  on(settings.element, 'pointerdown', (e) => pointer.pressed = true)
  on(settings.element, 'pointerup', (e) => pointer.pressed = false)

  on(window, 'selectchar', (e) => settings.cursorBrush.char = e.detail)
  on(window, 'select-text-color', (e) => settings.color = e.detail.color)
  on(window, 'select-bg-color', (e) => settings.backgroundColor = e.detail.color)
  on(window, 'resize-canvas', e => {
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
  on(window, 'clear-canvas', (e) => { clear(); settings.generateData = []})
  on(window, 'generate', e => {
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

  on(window, 'reset', e => {
    settings.generateBox = JSON.parse(JSON.stringify(defaultSettings)).generateBox
    settings.generateTextTitle = JSON.parse(JSON.stringify(defaultSettings)).generateTextTitle
  })

  on(window, 'download', e => {
    if(!settings.eventListener['download']) return 
    const filetype = document.getElementById("download-filetype").value
    if(filetype === "img") {
      const canvas = settings.element
      canvas.toBlob( blob => saveBlobAsFile(blob, 'export.png'))
    } else if(filetype === "txt") {
      const cols = getCols()
      const rows = getRows()
      const txt = getData()
      let acc = "", ii = 0
      for(let x=0; x<cols; x++) {
        for(let y=0;y<rows; y++){
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
    } else if (filetype === "aca"){
      const txt = getData()
      saveSourceAsFile(JSON.stringify(txt), 'export.aca') 
    }
  })

  on(window, 'fontselect', e => { settings.generateTextTitle.fontname = e.detail })

  on(document,'keydown', e => {
    e.preventDefault();
    if (document.activeElement.tagName === "INPUT") return
    if (e.metaKey) {
      document.getElementById("metakey").classList.add("btn-active")
      document.getElementById("meta-detail-box").classList.remove("collapse")
      settings.mode.meta = true
    }
    if (isArrowKey(e.code)) handleArrowKey(arrowKeyToDirection(e.code), settings, pointer, metrics)
    setcommand(e, settings, pointer)
  })

  on(document,'keyup', e => {
    e.preventDefault();
    if (document.activeElement.tagName === "INPUT") return
    
    if (!e.metaKey) {
      document.getElementById("metakey").classList.remove("btn-active")
      document.getElementById("meta-detail-box").classList.add("collapse")
      settings.mode.meta = false

      // since keyup wont be fired when holding metaKey (cmd). 
      // in this case when holding 'cmd' + 'd' to draw. 
      // we have to release 'cmd' key to stop drawing, same goes for the 'erase'.
      // https://stackoverflow.com/a/57153300
      pointer.pressed = false 
    }

    if(e.code === "KeyD" || e.code === "KeyE"){ pointer.pressed = false }
  })

  let fileInput = document.getElementById("file-input")
  const fileTypes = ['txt', 'aca']; 

  on(fileInput, "change", () => {
    if (settings.id !== "draw_canvas") return
    const reader = new FileReader()
    const dataObj = []
    let isSuccess = false
    reader.onload = () => {
      if (reader.fileExtension === "txt") {
        for (let x = 0; x < reader.result.length; x++) {
          if(reader.result.charAt(x) !== '\n'){
            dataObj.push({char: reader.result.charAt(x), backgroundColor: "white", color: "black"})
          }
        }
        pushData(dataObj)
      }

      if (reader.fileExtension === "aca") {
        pushData(JSON.parse(reader.result))
      }
    }

    for (let file of fileInput.files) {
      reader.fileName = file.name
      reader.fileExtension = file.name.split('.').pop().toLowerCase()
      isSuccess = fileTypes.indexOf(reader.fileExtension) > -1;
      if(isSuccess) { 
        reader.readAsText(file)
      } else {
        alert("file type is not supported.")
      }
    } 
  })
}


// ---------- helpers -------

function handleArrowKey(arrow, settings, pointer, metrics) {
  if(settings.id === "pattern_canvas" || settings.mode.options.control.status === "mouse") return
  const metaStepsX = settings.mode.meta ? window.acara.patternSize.cols : 1
  const metaStepsY = settings.mode.meta ? window.acara.patternSize.rows : 1
  if(arrow.axis === "x") pointer.x += ( metrics.cellWidth * metaStepsX) * arrow.dir
  if(arrow.axis === "y") pointer.y += ( metrics.lineHeight * metaStepsY) * arrow.dir 
}

function arrowKeyToDirection(e){
  let dir = 0, axis = "x"
  if(e === "ArrowLeft") dir = -1
  if(e === "ArrowRight") dir = 1
  if(e === "ArrowUp") dir = -1, axis = "y"
  if(e === "ArrowDown") dir = 1, axis = "y"
  return {dir, axis}
}

function isArrowKey(c) {
  return c === "ArrowLeft"
      || c === "ArrowRight"
      || c === "ArrowUp"
      || c === "ArrowDown"
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

// function covertObjectToBinary(obj) {
//   let output = '',
//       input = JSON.stringify(obj) 
//   for (let i = 0; i < input.length; i++) {
//       output += input[i].charCodeAt(0).toString(2) + " ";
//   }
//   return output.trimEnd();
// }

// function convertBinaryToObject(str) {
//   var newBin = str.split(" ");
//   var binCode = [];
//   for (let i = 0; i < newBin.length; i++) {
//       binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
//   }
//   let jsonString = binCode.join("");
//   return JSON.parse(jsonString)
// }