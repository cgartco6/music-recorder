export default class BPMDetector {
    detect(audioData) {
        return new Promise((resolve) => {
            const peaks = this.findPeaks(audioData);
            const intervals = this.calculateIntervals(peaks);
            const bpm = this.calculateBPM(intervals);
            resolve(Math.round(bpm));
        });
    }

    findPeaks(data) {
        const peaks = [];
        const threshold = 0.2;
        
        for (let i = 1; i < data.length - 1; i++) {
            if (Math.abs(data[i]) > threshold && 
                data[i] > data[i-1] && 
                data[i] > data[i+1]) {
                peaks.push(i);
            }
        }
        return peaks;
    }

    calculateIntervals(peaks) {
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i-1]);
        }
        return intervals;
    }

    calculateBPM(intervals) {
        if (intervals.length === 0) return 120;
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const sampleRate = 48000;
        const secondsPerBeat = avgInterval / sampleRate;
        const bpm = 60 / secondsPerBeat;
        
        return Math.min(200, Math.max(60, bpm));
    }
}
