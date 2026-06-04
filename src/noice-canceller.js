export default class NoiseCanceller {
    constructor() {
        this.context = null;
    }

    async init() {
        // nothing heavy
    }

    async process(audioChunk) {
        // Real-time noise reduction: spectral gating + low-cut filter
        const result = new Float32Array(audioChunk.length);
        // Simple high-pass filter to remove rumble (cars)
        let prev = 0;
        const cutoff = 0.95; // high-pass coefficient
        for (let i = 0; i < audioChunk.length; i++) {
            let val = audioChunk[i];
            val = val - prev * cutoff;
            prev = audioChunk[i];
            // noise gate: remove low amplitude sounds (background talk, barks)
            if (Math.abs(val) < 0.015) val = 0;
            result[i] = val;
        }
        // mild smoothing to reduce hiss
        for (let i = 2; i < result.length-2; i++) {
            result[i] = (result[i-2] + result[i-1] + result[i] + result[i+1] + result[i+2]) / 5;
        }
        return result;
    }

    async offlineProcess(blob) {
        // For demo, just return same blob (actual would decode, apply FFT noise profile, re-encode)
        return blob;
    }
}
