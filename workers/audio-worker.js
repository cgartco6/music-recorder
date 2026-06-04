class AudioProcessor extends AudioWorkletProcessor {
    constructor() { super(); this.buffer = new Float32Array(4096); this.idx=0; this.recording=false; this.port.onmessage = e => { if(e.data.type==='start') this.recording=true; else this.recording=false; }; }
    process(inputs) { if(!this.recording) return true; const data=inputs[0][0]; if(!data) return true; for(let i=0;i<data.length;i++){ this.buffer[this.idx++]=data[i]; if(this.idx>=4096){ this.port.postMessage({type:'chunk',audioData:new Float32Array(this.buffer)}); this.idx=0; } } return true; }
}
registerProcessor('audio-processor', AudioProcessor);
