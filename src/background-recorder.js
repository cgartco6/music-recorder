export default class BackgroundRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioContext = null;
        this.source = null;
        this.processor = null;
        this.isRecording = false;
        this.latestChunk = null;
        this.stream = null;
    }

    async init() {
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: 48000,
                channelCount: 2
            }
        });
        this.audioContext = new AudioContext({ sampleRate: 48000 });
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        await this.audioContext.audioWorklet.addModule('workers/audio-worker.js');
        this.processor = new AudioWorkletNode(this.audioContext, 'audio-processor');
        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        this.processor.port.onmessage = (e) => {
            if (e.data.type === 'chunk' && this.isRecording) {
                this.latestChunk = e.data.audioData;
                this.audioChunks.push(e.data.audioData);
            }
        };
    }

    start() {
        this.isRecording = true;
        this.audioChunks = [];
        this.latestChunk = null;
        this.processor.port.postMessage({ type: 'start' });
    }

    getLatestAudioChunk() {
        return this.latestChunk;
    }

    stop() {
        this.isRecording = false;
        this.processor.port.postMessage({ type: 'stop' });
        const totalLength = this.audioChunks.reduce((acc, arr) => acc + arr.length, 0);
        const combined = new Float32Array(totalLength);
        let offset = 0;
        for (let chunk of this.audioChunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }
        const wav = this.float32ToWav(combined, 48000);
        return Promise.resolve(new Blob([wav], { type: 'audio/wav' }));
    }

    float32ToWav(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        const writeString = (view, offset, str) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        let offset = 44;
        for (let i = 0; i < samples.length; i++) {
            let s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }
        return buffer;
    }
}
