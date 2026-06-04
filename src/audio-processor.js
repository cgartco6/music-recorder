export default class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.isRecording = false;
        
        this.port.onmessage = (e) => {
            if (e.data.type === 'start') {
                this.isRecording = true;
                this.bufferIndex = 0;
            } else if (e.data.type === 'stop') {
                this.isRecording = false;
            }
        };
    }

    process(inputs) {
        if (!this.isRecording) return true;
        
        const input = inputs[0];
        if (!input || !input[0]) return true;
        
        const channelData = input[0];
        
        for (let i = 0; i < channelData.length; i++) {
            this.buffer[this.bufferIndex++] = channelData[i];
            
            if (this.bufferIndex >= this.bufferSize) {
                const copy = new Float32Array(this.buffer);
                this.port.postMessage({
                    type: 'chunk',
                    audioData: copy
                });
                this.bufferIndex = 0;
            }
        }
        
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
