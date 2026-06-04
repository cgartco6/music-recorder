export default class BackgroundRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioContext = null;
        this.source = null;
        this.processor = null;
        this.isRecording = false;
        this.latestChunk = null;
    }

    async init() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 48000,
                    channelCount: 2
                }
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 48000
            });
            this.source = this.audioContext.createMediaStreamSource(stream);
            
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
            
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            throw error;
        }
    }

    start() {
        this.isRecording = true;
        this.audioChunks = [];
        this.latestChunk = null;
        this.processor.port.postMessage({ type: 'start' });
        return Promise.resolve();
    }

    getLatestAudioChunk() {
        return this.latestChunk;
    }

    stop() {
        this.isRecording = false;
        this.processor.port.postMessage({ type: 'stop' });
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        return Promise.resolve(audioBlob);
    }
}
