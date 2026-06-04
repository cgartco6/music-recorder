export default class BPMDetector {
    detect(audioData) {
        return new Promise((resolve) => {
            let peaks = [];
            for (let i = 1; i < audioData.length-1; i++) {
                if (Math.abs(audioData[i]) > 0.2 && audioData[i] > audioData[i-1] && audioData[i] > audioData[i+1]) {
                    peaks.push(i);
                }
            }
            if (peaks.length < 2) { resolve(120); return; }
            let intervals = [];
            for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i-1]);
            let avgInterval = intervals.reduce((a,b)=>a+b,0)/intervals.length;
            let bpm = 60 / (avgInterval / 48000);
            bpm = Math.min(200, Math.max(60, bpm));
            resolve(Math.round(bpm));
        });
    }
}
