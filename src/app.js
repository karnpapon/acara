import { run } from "/src/modules/runner.js";
import * as prog0 from "/src/programs/draw.js";
import Char, { charsList } from "/src/modules/chars.js";

export function setup(){
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

export function start(){
  figlet.preloadFonts(["Standard"], () => {
    console.log("FIGlet loaded!");
  
    const character = new Char();
  
    const output = document.getElementById("output");
    const chartable = document.getElementById("chars");
    const currentChar = document.getElementById("current-char");
    const currentCharBg = document.getElementById("current-char-status");
    const resizeBtn = document.getElementById("resize-canvas");
    const clearBtn = document.getElementById("clear-canvas");
    const settingBtn = document.getElementById("setting");
    const generatorSectionTitle = document.getElementById("generator-title");
    const settingSection = document.getElementById("setting-section");
    const aboutSectionTitle = document.getElementById("about-section");
    const menu = document.getElementById("menu");
    const drawBtn = document.getElementById("draw");
    const downloadBtn = document.getElementById("download");
    const resetBtn = document.getElementById("reset");
    const form = document.getElementById("generator-form");
    const about = document.getElementById("about");
    const pickerTextColor = document.getElementById("picker-text");
    const pickerBgColor = document.getElementById("picker-bg");
    const selectTextColorBtn = document.getElementById("text-color");
    const selectBgColorBtn = document.getElementById("bg-color");
  
    currentCharBg.onclick = () => {
      chartable.classList.toggle("collapse");
    };
    settingBtn.onclick = () => {
      settingSection.classList.toggle("collapse");
    };
    generatorSectionTitle.onclick = () => {
      form.classList.toggle("collapse");
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
  
    run(prog0, { element: output })
      .catch(errorHandler)
      .then((res) => {
        menu.className = "menu ready";
        charsList.map((char) => {
          let c = document.createElement("p");
          c.innerText = char;
          c.addEventListener("click", () => {
            character.selectChar(char);
            currentChar.innerText = char
          });
          chartable.appendChild(c);
        });
  
        drawBtn.setAttribute("data-usage", "draw");
      });
  
    function errorHandler(e) {
      console.warn(e.message);
      console.log(e.error);
    }
  });
}

