export default class InstrumentDetector {
    constructor() {
        this.instruments = ['Drums', 'Guitar', 'Piano', 'Bass', 'Vocals', 'Synthesizer'];
    }

    async detect(audioData) {
        const features = this.analyzeFrequencyBands(audioData);
        const detected = this.matchInstruments(features);
        return detected;
    }

    analyzeFrequencyBands(audioData) {
        const bands = {
            bass: 0,
            lowMid: 0,
            mid: 0,
            highMid: 0,
            high: 0
        };
        
        const fftSize = 1024;
        for (let i = 0; i < Math.min(audioData.length, fftSize); i++) {
            const freq = (i / fftSize) * 24000;
            const magnitude = Math.abs(audioData[i]);
            
            if (freq < 250) bands.bass += magnitude;
            else if (freq < 500) bands.lowMid += magnitude;
            else if (freq < 2000) bands.mid += magnitude;
            else if (freq < 8000) bands.highMid += magnitude;
            else bands.high += magnitude;
        }
        
        return bands;
    }

    matchInstruments(bands) {
        const detected = [];
        
        if (bands.bass > bands.mid) detected.push('Bass');
        if (bands.lowMid > 0.5) detected.push('Guitar');
        if (bands.mid > 0.4) detected.push('Piano');
        if (bands.highMid > 0.3) detected.push('Vocals');
        if (bands.high > 0.2) detected.push('Synthesizer');
        if (bands.bass > 0.4 && bands.mid > 0.3) detected.push('Drums');
        
        return detected.length ? detected : ['Unknown'];
    }
}
