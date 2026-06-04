export default class CharacterAI {
    constructor() {
        this.gender = 'female';
        this.mouthOpen = 0;
        this.emotion = 'neutral';
        this.userPhoto = null;
        this.expressions = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
    }

    setGender(gender) { this.gender = gender; }
    setUserPhoto(dataUrl) { this.userPhoto = dataUrl; }

    updateLipSync(energy) {
        // Map audio energy to mouth openness (0-1)
        this.mouthOpen = Math.min(1, energy * 1.5);
        if (energy > 0.7) this.emotion = 'excited';
        else if (energy > 0.3) this.emotion = 'happy';
        else this.emotion = 'neutral';
    }

    getCurrentMouthOpen() { return this.mouthOpen; }
    getCurrentEmotion() { return this.emotion; }

    triggerRandomExpression() {
        const random = this.expressions[Math.floor(Math.random() * this.expressions.length)];
        this.emotion = random;
        setTimeout(() => { if(this.emotion === random) this.emotion = 'neutral'; }, 1000);
    }
}
