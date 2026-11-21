// https://github.com/g200kg/webaudio-controls/blob/master/webaudio-controls.js

// This works when youuse a bundler such as rollup
// If you do no wan to use a bundler, then  look at other examples
// that build in pure JS the syles and html template directly
// in the code...
let style = `
:host {
	display: inline-block;
	background-color: #ccc;
	position: relative;
}

#top {
	padding: 2px;
	color: #111;
	border-top: 2px solid #fff;
	border-left: 2px solid #fff;
	border-bottom: 2px solid #999;
	border-right: 2px solid #999;
}

.title {
	padding: 2px 6px;
	background-color: darkblue;
	color: white;
}

.block {
	margin: 8px 6px;
}

select {
	font-size: 1rem;
	min-width: 2.5rem;
}
`;

let template = `
<div id="top">
	<div class="title">TinySynth</div>

	<div class="block">
		<span>Program</span>
		<select id="program"></select>
	</div>

	<div class="block">
		<span>Volume</span>
		<input type="range" min="0" max="1" step="0.01" id="volume">
	</div>

	<div class="block">
		<span>Quality</span>
		<select id="quality">
			<option value="1">1</option>
			<option value="0">0</option>
		</select>
	</div>
</div>
`;

const getAssetUrl = (asset) => {
	const base = new URL('.', import.meta.url);
	return `${base}${asset}`;
};

// The GUI is a WebComponent. Not mandatory but useful.
// MANDORY : the GUI should be a DOM node. WebComponents are
// practical as they encapsulate everyhing in a shadow dom
export default class TinySynthHTMLElement extends HTMLElement {
	// plugin = the same that is passed in the DSP part. It's the instance
	// of the class that extends WebAudioModule. It's an Observable plugin
	constructor(plugin) {
		super();

		this.root = this.attachShadow({
			mode: 'open',
		});
		this.root.innerHTML = `<style>${style}</style>${template}`;

		let programs = plugin.audioNode.getProgramList();
		let selectP = this.root.getElementById("program");

		for (let i = -1; i < programs.length; i++) {
			let opt = document.createElement("OPTION");
			opt.textContent = i < 0 ? "Standard Drum Kit" : programs[i].name;
			opt.value = i;
			selectP.appendChild(opt);
		}
		selectP.addEventListener("change", (e) => {
			plugin.audioNode.setProgram(e.target.value)
		});

		let selectQ = this.root.getElementById("quality");
		selectQ.addEventListener("change", (e) => {
			plugin.audioNode.setQuality(e.target.value);
		});

		let rangeV = this.root.getElementById("volume");
		rangeV.addEventListener("input", (e) => {
			plugin.audioNode.setVolume(e.target.value);
		});

		selectP.value = plugin.audioNode.program;
		selectQ.value = plugin.audioNode.quality;
		rangeV.value = plugin.audioNode.volume;

		// MANDATORY for the GUI to observe the plugin state
		this.plugin = plugin;
		this.plugin.audioNode.gui = this;

		this.renderState = function (state) {
			selectP.value = state.program;
			selectQ.value = state.quality;
			rangeV.value = state.volume;
		}
	}

	connectedCallback() {
		this.setResources();
		this.setKnobs();
		this.setSwitchListener();

		window.requestAnimationFrame(this.handleAnimationFrame);
	}
	updateStatus = (status) => {
		//this.shadowRoot.querySelector('#switch1').value = status;
	};

	handleAnimationFrame = () => {
		const { enabled } = this.plugin.audioNode.getParamsValues();

		window.requestAnimationFrame(this.handleAnimationFrame);
	};

	/**
	 * Change relative URLS to absolute URLs for CSS assets, webaudio controls spritesheets etc.
	 */
	setResources() {

	}

	async setKnobs() {

	}

	setSwitchListener() {

	}

	// name of the custom HTML element associated
	// with the plugin. Will appear in the DOM if
	// the plugin is visible
	static is() {
		return 'wasabi-tinysynth';
	}
}

if (!customElements.get(TinySynthHTMLElement.is())) {
	customElements.define(
		TinySynthHTMLElement.is(),
		TinySynthHTMLElement
	);
}
