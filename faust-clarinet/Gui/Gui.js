import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class faustClarinetGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>
    .my-pedal {
        background-color: #191919;
        height: 200px;
        width: 250px;
    }

    .drag {
        padding: 1px;
        margin: 1px;
        text-align: center;
        display: inline-block;
        box-sizing: border-box;
        touch-action: none;
        position: static;
        place-self: center;
    }

    label.drag {
        text-align: center;
        display: block;
        touch-action: none;
        position: static;
        z-index: 1;
        color: #AAA;
        font-family: serif;
        font-size: 0.9rem;
        border: none;
        align-self: start;
    }

    webaudio-knob {
        display: inline-block;
        position: relative;
        margin: 0;
        padding: 0;
        cursor: pointer;
        font-family: sans-serif;
        font-size: 11px;
    }

    .webaudio-knob-body {
        background-image: url(&quot;/./img/knobs/Carbon.png&quot;);
        background-size: 40px 4040px;
        outline: none;
        width: 40px;
        height: 40px;
        background-position: 0px 0px;
        transform: rotate(0deg);
        display: inline-block;
        position: relative;
        z-index: 1;
        margin: 0;
        padding: 0;
    }

    .webaudioctrl-tooltip {
        display: inline-block;
        position: absolute;
        margin: 0 -1000px;
        z-index: 999;
        background: #eee;
        color: #000;
        border: 1px solid #666;
        border-radius: 4px;
        padding: 5px 10px;
        text-align: center;
        left: 0;
        top: 0;
        font-size: 11px;
        opacity: 0;
        visibility: hidden;
    }

    .webaudioctrl-tooltip:before {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -8px;
        border: 8px solid transparent;
        border-top: 8px solid #666;
    }

    .webaudioctrl-tooltip:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border: 6px solid transparent;
        border-top: 6px solid #eee;
    }
</style>

<div id="faustClarinet" class="resize-drag my-pedal target-style-container gradiant-target">
    <div id="grid"
        style="display: grid;grid-template-columns: repeat(3, 1fr);grid-template-rows: repeat(3, 1fr);margin-top: 20px;">

        <div class="drag">
            <webaudio-knob id="/clarinet/midi/envAttack" src="/./img/knobs/Carbon.png" sprites="100" min="0" max="30"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <div class="drag">
            <webaudio-knob id="/clarinet/otherParams/reedStiffness" src="/./img/knobs/Carbon.png" sprites="100" min="0" max="1"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <div class="drag">
            <webaudio-knob id="/clarinet/otherParams/bellOpening" src="/./img/knobs/Carbon.png" sprites="100" min="0" max="1"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <label for="/clarinet/midi/envAttack" class="drag" contenteditable="false">Attack</label>

        <label for="/clarinet/otherParams/reedStiffness" class="drag" contenteditable="false">Reed</label>

        <label for="/clarinet/otherParams/bellOpening" class="drag" contenteditable="false">Opening</label>

        <div class="drag">
            <webaudio-knob id="/clarinet/otherParams/vibratoFreq" src="/./img/knobs/Carbon.png" sprites="100" min="1" max="10"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <div class="drag">
            <webaudio-knob id="/clarinet/otherParams/vibratoGain" src="/./img/knobs/Carbon.png" sprites="100" min="0" max="1"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <div class="drag">
            <webaudio-knob id="/clarinet/otherParams/outGain" src="/./img/knobs/Carbon.png" sprites="100" min="0" max="1"
                step="0.01" width="40" height="40" style="touch-action: none; display: block;">
                <div class="webaudio-knob-body" tabindex="1" touch-action="none"></div>
                <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
        </div>

        <label for="/clarinet/otherParams/vibratoFreq" class="drag" contenteditable="false">VibRate</label>

        <label for="/clarinet/otherParams/vibratoGain" class="drag" contenteditable="false">VibDepth</label>

        <label for="/clarinet/otherParams/outGain" class="drag" contenteditable="false">Volume</label>
    </div>

</div>`;

    this.isOn;
    this.state = new Object();
    this.setKnobs();
    this.setSliders();
    this.setSwitches();
    //this.setSwitchListener();
    this.setInactive();
    // Change #pedal to .my-pedal for use the new builder
    this._root.querySelector(".my-pedal").style.transform = "none";
    //this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');

    // Compute base URI of this main.html file. This is needed in order
    // to fix all relative paths in CSS, as they are relative to
    // the main document, not the plugin's main.html
    this.basePath = getBaseURL();
    console.log("basePath = " + this.basePath);

    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePathsInCSS();

    // optionnal : set image background using a relative URI (relative
    // to this file)
    //this.setImageBackground("/img/BigMuffBackground.png");

    // Monitor param changes in order to update the gui
    window.requestAnimationFrame(this.handleAnimationFrame);
  }

  fixRelativeImagePathsInCSS() {
    // change webaudiocontrols relative paths for spritesheets to absolute
    let webaudioControls = this._root.querySelectorAll("webaudio-knob, webaudio-slider, webaudio-switch, img");
    webaudioControls.forEach((e) => {
      let currentImagePath = e.getAttribute("src");
      if (currentImagePath !== undefined) {
        //console.log("Got wc src as " + e.getAttribute("src"));
        let imagePath = e.getAttribute("src");
        e.setAttribute("src", this.basePath + "/" + imagePath);
        //console.log("After fix : wc src as " + e.getAttribute("src"));
      }
    });

    let sliders = this._root.querySelectorAll("webaudio-slider");
    sliders.forEach((e) => {
      let currentImagePath = e.getAttribute("knobsrc");
      if (currentImagePath !== undefined) {
        let imagePath = e.getAttribute("knobsrc");
        e.setAttribute("knobsrc", this.basePath + "/" + imagePath);
      }
    });

    // BMT Get all fonts
    // Need to get the attr font
    let usedFonts = "";
    let fonts = this._root.querySelectorAll("label[font]");
    fonts.forEach((e) => {
      if (!usedFonts.includes(e.getAttribute("font"))) usedFonts += "family=" + e.getAttribute("font") + "&";
    });
    let link = document.createElement("link");
    link.rel = "stylesheet";
    if (usedFonts.slice(0, -1))
      link.href = "https://fonts.googleapis.com/css2?" + usedFonts.slice(0, -1) + "&display=swap";
    document.querySelector("head").appendChild(link);

    // BMT Adapt for background-image
    let divs = this._root.querySelectorAll("div");
    divs.forEach((e) => {
      if ("background-image" in e.style) {
        let currentImagePath = e.style.backgroundImage.slice(4, -1);
        if (currentImagePath !== undefined) {
          let imagePath = e.style.backgroundImage.slice(5, -2);
          if (imagePath != "") e.style.backgroundImage = "url(" + this.basePath + "/" + imagePath + ")";
        }
      }
    });
  }

  setImageBackground() {
    // check if the shadowroot host has a background image
    let mainDiv = this._root.querySelector("#main");
    mainDiv.style.backgroundImage = "url(" + this.basePath + "/" + imageRelativeURI + ")";
  }

  attributeChangedCallback() {
    console.log("Custom element attributes changed.");
    this.state = JSON.parse(this.getAttribute("state"));
    let tmp = "/PingPongDelayFaust/bypass";

    if (this.state[tmp] == 1) {
      this._root.querySelector("#switch1").value = 0;
      this.isOn = false;
    } else if (this.state[tmp] == 0) {
      this._root.querySelector("#switch1").value = 1;
      this.isOn = true;
    }

    this.knobs = this._root.querySelectorAll(".knob");
    console.log(this.state);

    for (var i = 0; i < this.knobs.length; i++) {
      this.knobs[i].setValue(this.state[this.knobs[i].id], false);
      console.log(this.knobs[i].value);
    }
  }
  handleAnimationFrame = () => {
    this._root.getElementById("/clarinet/midi/envAttack").value =
	  this._plug.audioNode.getParamValue("/clarinet/midi/envAttack");

    this._root.getElementById("/clarinet/otherParams/reedStiffness").value =
      this._plug.audioNode.getParamValue("/clarinet/otherParams/reedStiffness");

    this._root.getElementById("/clarinet/otherParams/bellOpening").value =
      this._plug.audioNode.getParamValue("/clarinet/otherParams/bellOpening");

    this._root.getElementById("/clarinet/otherParams/vibratoFreq").value =
      this._plug.audioNode.getParamValue("/clarinet/otherParams/vibratoFreq");

    this._root.getElementById("/clarinet/otherParams/vibratoGain").value =
      this._plug.audioNode.getParamValue("/clarinet/otherParams/vibratoGain");
 
    this._root.getElementById("/clarinet/otherParams/outGain").value =
      this._plug.audioNode.getParamValue("/clarinet/otherParams/outGain");

    window.requestAnimationFrame(this.handleAnimationFrame);
  };

  get properties() {
    this.boundingRect = {
      dataWidth: {
        type: Number,
        value: 258,
      },
      dataHeight: {
        type: Number,
        value: 280,
      },
    };
    return this.boundingRect;
  }

  static get observedAttributes() {
    return ["state"];
  }

  setKnobs() {
    this._root
      .getElementById("/clarinet/midi/envAttack")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/midi/envAttack", e.target.value));
    this._root
      .getElementById("/clarinet/otherParams/reedStiffness")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/otherParams/reedStiffness", e.target.value));
    this._root
      .getElementById("/clarinet/otherParams/bellOpening")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/otherParams/bellOpening", e.target.value));
    this._root
      .getElementById("/clarinet/otherParams/vibratoFreq")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/otherParams/vibratoFreq", e.target.value)
      );
    this._root
      .getElementById("/clarinet/otherParams/vibratoGain")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/otherParams/vibratoGain", e.target.value));
	   this._root
      .getElementById("/clarinet/otherParams/outGain")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/clarinet/otherParams/outGain", e.target.value));
  }

  setSliders() {}

  setSwitches() {}

  setInactive() {
    let switches = this._root.querySelectorAll(".switch webaudio-switch");

    switches.forEach((s) => {
      console.log("### SWITCH ID = " + s.id);
      this._plug.audioNode.setParamValue(s.id, 0);
    });
  }
}
try {
  customElements.define("wap-faust-clarinet", faustClarinetGui);
  console.log("Element defined");
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
