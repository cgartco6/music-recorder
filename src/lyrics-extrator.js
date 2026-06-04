export default class LyricsExtractor {
    constructor() {
        this.lyricsDatabase = {
            'happy': 'Feeling good, dancing all night long',
            'sad': 'Tears falling down, heart breaking apart',
            'energetic': 'Rising up, reaching for the stars',
            'calm': 'Peaceful moments, quiet thoughts',
            'default': 'Music flowing through the air'
        };
    }

    async extract(audioData) {
        const features = this.extractFeatures(audioData);
        const mood = this.detectMood(features);
        
        const lyrics = this.generateLyrics(mood, features);
        return lyrics;
    }

    extractFeatures(audioData) {
        let energy = 0;
        let rms = 0;
        
        for (let i = 0; i < audioData.length; i++) {
            rms += audioData[i] * audioData[i];
        }
        rms = Math.sqrt(rms / audioData.length);
        
        for (let i = 1; i < audioData.length; i++) {
            energy += Math.abs(audioData[i] - audioData[i-1]);
        }
        
        return { rms, energy, zeroCrossing: energy / audioData.length };
    }

    detectMood(features) {
        if (features.energy > 0.5) return 'energetic';
        if (features.rms > 0.3) return 'happy';
        if (features.rms < 0.1) return 'calm';
        return 'default';
    }

    generateLyrics(mood, features) {
        let lyrics = this.lyricsDatabase[mood] || this.lyricsDatabase.default;
        
        if (features.energy > 0.7) {
            lyrics += ' (Intense beat dropping)';
        } else if (features.energy < 0.2) {
            lyrics += ' (Soft melody playing)';
        }
        
        return lyrics;
    }
}
