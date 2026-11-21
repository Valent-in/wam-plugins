/** @typedef { import('../../sdk-parammgr').ParamMgrNode } ParamMgrNode */
/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import CompositeAudioNode from '../utils/sdk-parammgr/src/CompositeAudioNode.js';
import { WebAudioTinySynth } from './utils/webaudio-tinysynth.js';

// name is not so important here, the file Node.js is imported by the main plugin file (index.js)
export default class TinySynthNode extends CompositeAudioNode {
	/**
	 * @type {ParamMgrNode}
	 */
	_wamNode = undefined;

	/**
	 * @param {ParamMgrNode} wamNode
	 */
	// Mandatory.
	setup(wamNode) {
		this._wamNode = wamNode;
		this.connectNodes();
	}

	constructor(context, options) {
		super(context, options);
		this.createNodes();

		this.synth = new WebAudioTinySynth({ useReverb: 0, internalcontext: 0, voices: Infinity });
		this.synth.setAudioContext(this.context, this.outputNode);

		this.program = 0;
		this.quality = this.synth.quality;
		this.volume = this.synth.masterVol;
	}

	scheduleEvents(...events) {
		super.scheduleEvents(...events);

		events.forEach((event) => {
			if (event.type !== "wam-midi")
				return;

			const msg = event.data.bytes;
			const time = event.time;
			this.synth.send(msg, time);
		});
	}

	/*  #########  Personnal code for the web audio graph  #########   */
	createNodes() {
		// mandatory, will create defaul input and output
		this.outputNode = this.context.createGain();
	}

	connectNodes() {
		this._output = this.outputNode;
	}


	isEnabled = true;
	set status(_sig) {}

	// MANDATORY : redefine these methods
	// eslint-disable-next-line class-methods-use-this
	getParamValue(name) {
		return this._wamNode.getParamValue(name);
	}

	setParamValue(name, value) {
		return this._wamNode.setParamValue(name, value);
	}

	getParamsValues() {
		return this._wamNode.getParamsValues();
	}

	setParamsValues(values) {
		return this._wamNode.setParamsValues(values);
	}
	// -----------------------------------


	getState() {
		return { program: this.program, quality: this.quality, volume: this.volume };
	}

	async setState(obj) {
		await this.synth.ready();

		this.setProgram(obj.program);
		this.setQuality(obj.quality);
		this.setVolume(obj.volume);

		this.gui.renderState(this.getState());
	}

	getProgramList() {
		return this.synth.program;
	}

	setProgram(value) {
		this.program = (value === undefined) ? 0 : Number(value);

		if (this.program >= 0) {
			this.synth.setProgram(0, this.program);
			this.synth.rhythm[0] = 0;
		} else {
			this.synth.rhythm[0] = 1;
		}
	}

	setQuality(value) {
		this.quality = (value === undefined) ? 1 : Number(value);
		this.synth.setQuality(this.quality);
	}

	setVolume(value) {
		this.volume = (value === undefined) ? 0.5 : Number(value);
		this.synth.setMasterVol(this.volume)
	}
}
