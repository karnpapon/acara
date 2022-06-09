import { run } from "/src/modules/runner.js";
import * as prog0 from "/src/programs/draw.js";
import * as prog1 from "/src/programs/pattern_canvas.js";
import Char, { charsList } from "/src/modules/chars.js";

// global state, shared btw run()
window.acara = {
  pattern: [],
  patternSize: {cols: 8, rows: 4}
}


function setupFontSelector(){
  const fontSelector = document.getElementById("fontname");
  let fontname;
  let httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "fontlists.json", true);
  httpRequest.send();
  httpRequest.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      fontname = JSON.parse(this.response);
      for (let i = 0; i < fontname.data.length; i++) {
        const opt = document.createElement("option");
        opt.value = fontname.data[i];
        opt.label = fontname.data[i];
        if (fontname.data[i] === "Standard") {
          opt.selected = true;
        }
        fontSelector.appendChild(opt);
      }
    }
  });
  
  fontSelector.onchange = (e) => {
    window.dispatchEvent(
      new CustomEvent("fontselect", { detail: e.target.value })
    );
    e.preventDefault();
  };
  
  figlet.defaults({ fontPath: "/fonts" });
}

function setupDOM(){
  const character = new Char();
  const currentChar = document.getElementById("current-char");
  const currentCharBg = document.getElementById("current-char-status");
  const charTableWrapper = document.getElementById("char-table-wrapper");
  const resizeBtn = document.getElementById("resize-canvas");
  const clearBtn = document.getElementById("clear-canvas");
  const settingBtn = document.getElementById("setting");
  const settingSection = document.getElementById("setting-section");
  const aboutSectionTitle = document.getElementById("about-section");
  const drawBtn = document.getElementById("draw");
  const downloadBtn = document.getElementById("download");
  const resetBtn = document.getElementById("reset");
  const form = document.getElementById("generator-form");
  const about = document.getElementById("about");
  const pickerTextColor = document.getElementById("picker-text");
  const pickerBgColor = document.getElementById("picker-bg");
  const selectTextColorBtn = document.getElementById("text-color");
  const selectBgColorBtn = document.getElementById("bg-color");
  const patternAreaCol = document.getElementById("pattern-area-col");
  const patternAreaRow = document.getElementById("pattern-area-row");

  currentCharBg.onclick = () => {
    charTableWrapper.classList.toggle("collapse-h-full");
  };
  settingBtn.onclick = () => {
    settingSection.classList.toggle("collapse");
  };
  aboutSectionTitle.onclick = () => {
    about.classList.toggle("collapse");
  };
  selectTextColorBtn.onclick = () => {
    pickerTextColor.classList.toggle("hide");
  };
  selectBgColorBtn.onclick = () => {
    pickerBgColor.classList.toggle("hide");
  };

  patternAreaCol.onclick = (e) => {
    const cols = 19.22 * e.target.value
    const rows = 32 * patternAreaRow.value
    const area = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 222" preserveAspectRatio="none"><rect width="${cols}" height="${rows}" style="fill:rgb(0,0,0);" /></svg>') 0/100% 100%, linear-gradient(#fff,#fff);`
    document.getElementById("pattern-canvas-overlay").setAttribute("style", `-webkit-mask: ${area}`)
    window.acara.patternSize = {cols: parseInt(e.target.value), rows: parseInt(patternAreaRow.value)}
  };

  patternAreaRow.onclick = (e) => {
    const cols = 19.22 * patternAreaCol.value
    const rows = 32 * e.target.value
    const area = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 222" preserveAspectRatio="none"><rect width="${cols}" height="${rows}" style="fill:rgb(0,0,0);" /></svg>') 0/100% 100%, linear-gradient(#fff,#fff);`
    document.getElementById("pattern-canvas-overlay").setAttribute("style", `-webkit-mask: ${area}`)
    window.acara.patternSize = {cols: parseInt(patternAreaCol.value), rows: parseInt(e.target.value)}
  };

  AColorPicker.from(pickerTextColor).on("change", (picker, color) => {
    selectTextColorBtn.style.backgroundColor = color;
    window.dispatchEvent(
      new CustomEvent("select-text-color", { detail: { color } })
    );
    currentChar.style.color = color 
  });

  AColorPicker.from(pickerBgColor).on("change", (picker, color) => {
    selectBgColorBtn.style.backgroundColor = color;
    window.dispatchEvent(
      new CustomEvent("select-bg-color", { detail: { color } })
    );
    currentCharBg.style.backgroundColor = color 
  });

  resetBtn.onclick = (e) => {
    window.dispatchEvent(new Event("reset"));
    e.preventDefault();
  };
  downloadBtn.onclick = (e) => {
    window.dispatchEvent(new Event("download"));
    e.preventDefault();
  };
  resizeBtn.onclick = (e) => {
    const w = document.getElementById("width").value;
    const h = document.getElementById("height").value;
    const fsize = document.getElementById("font-size").value;
    window.dispatchEvent(
      new CustomEvent("resize-canvas", { detail: { w, h, fsize } })
    );
    e.preventDefault();
  };
  clearBtn.onclick = (e) => {
    window.dispatchEvent(new CustomEvent("clear-canvas"));
    e.preventDefault();
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get("title"),
      artists: formData.get("artists"),
      location: formData.get("location"),
      dates: formData.get("dates"),
      times: formData.get("times"),
      notes: formData.get("notes"),
      width: formData.get("width"),
      height: formData.get("height"),
    };

    window.dispatchEvent(new CustomEvent("generate", { detail: data }));
  };

  Object.keys(charsList).map((type) => {
    let groupTitle = document.createElement("div")
    let p = document.createElement("p");
    let charTable = document.createElement("div");
    const charTableWrapper = document.getElementsByClassName("char-table-wrapper")[0]
    groupTitle.classList.add("char-group-wrapper", "flex", "flex-col")
    charTable.classList.add("char-table", "collapse", `chars-${type}`)
    charTable.setAttribute("id", `chars-${type}`)
    p.setAttribute("id", "char-group-type")
    p.innerText = type;

    p.onclick = () => {
      charTable.classList.toggle("collapse");
    };

    charsList[type].map(char => {
      let pp = document.createElement("p"); 
      pp.addEventListener("click", () => {
        character.selectChar(char);
        currentChar.innerText = char
      });
      pp.innerText = char
      charTable.appendChild(pp)
    })

    groupTitle.appendChild(p)
    groupTitle.appendChild(charTable)
    charTableWrapper.appendChild(groupTitle)
  });

  drawBtn.setAttribute("data-usage", "draw");
}

export function setup(){
  setupDOM()
  setupFontSelector()
}

export function start(){

  const output = document.getElementById("output");
  const patternCanvas = document.getElementById("pattern-canvas");
  const menu = document.getElementById("menu");
  const canvasContainer = document.getElementById("canvas-container")

  figlet.preloadFonts(["Standard"], () => {
    console.log("FIGlet loaded!");

    // drawing canvas
    run(prog0, { element: output })
      .catch(errorHandler)
      .then((res) => { 
        menu.className = "menu ready"; 
        canvasContainer.className = "canvas-container ready"
      });

    // pattern brush canvas
    run(prog1, { element: patternCanvas })
    .catch(errorHandler)
    .then((res) => { });
  
    function errorHandler(e) {
      console.warn(e.message);
      console.log(e.error);
    }
  });
}

