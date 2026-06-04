export default class GenreClassifier {
    constructor() {
        this.genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip Hop'];
    }

    async classify(audioData) {
        const features = this.extractSpectralFeatures(audioData);
        const genre = this.classifyGenre(features);
        return genre;
    }

    extractSpectralFeatures(audioData) {
        let spectralCentroid = 0;
        let spectralFlux = 0;
        
        for (let i = 1; i < audioData.length; i++) {
            spectralFlux += Math.abs(audioData[i] - audioData[i-1]);
            spectralCentroid += i * Math.abs(audioData[i]);
        }
        
        spectralCentroid /= audioData.length;
        spectralFlux /= audioData.length;
        
        return { spectralCentroid, spectralFlux, rms: this.calculateRMS(audioData) };
    }

    calculateRMS(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    classifyGenre(features) {
        if (features.spectralFlux > 0.05 && features.rms > 0.2) return 'Rock';
        if (features.spectralCentroid > 2000 && features.rms > 0.15) return 'Pop';
        if (features.spectralFlux < 0.02 && features.rms < 0.1) return 'Classical';
        if (features.spectralFlux > 0.04 && features.rms > 0.25) return 'Electronic';
        if (features.spectralCentroid < 1500 && features.rms > 0.12) return 'Hip Hop';
        return 'Jazz';
    }
}
