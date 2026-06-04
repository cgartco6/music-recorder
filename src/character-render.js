export default class CharacterRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.mouthOpen = 0;
        this.emotion = 'neutral';
        this.blink = false;
        this.blinkTimer = 0;
        this.userImage = null;
        this.defaultFemale = this.generateDefaultAvatar('female');
        this.defaultMale = this.generateDefaultAvatar('male');
        this.animationId = null;
    }

    attachCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.startAnimationLoop();
    }

    loadTexture(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.userImage = img;
        };
        img.src = dataUrl;
    }

    updateExpression(mouthOpen, emotion) {
        this.mouthOpen = mouthOpen;
        this.emotion = emotion;
    }

    startAnimationLoop() {
        const animate = () => {
            if (this.canvas && this.ctx) this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
        // Blink every 3-5 seconds
        setInterval(() => { this.blink = true; setTimeout(() => { this.blink = false; }, 150); }, 3000);
    }

    draw() {
        const w = this.canvas.width, h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        // Background gradient
        const grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#f5f7fa');
        grad.addColorStop(1, '#c3cfe2');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw character
        const centerX = w/2, centerY = h/2 - 30;
        const faceRadius = 120;
        // Skin tone based on emotion
        let skin = '#f1c27d';
        if (this.emotion === 'angry') skin = '#e07a5f';
        else if (this.emotion === 'sad') skin = '#bc9a6c';
        this.ctx.fillStyle = skin;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, faceRadius, 0, 2*Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#8b5a2b';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Eyes (with blink)
        const eyeY = centerY - 40;
        const eyeXOffset = 45;
        this.ctx.fillStyle = '#2c3e50';
        if (!this.blink) {
            this.ctx.beginPath();
            this.ctx.arc(centerX - eyeXOffset, eyeY, 12, 0, 2*Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(centerX + eyeXOffset, eyeY, 12, 0, 2*Math.PI);
            this.ctx.fill();
            // Pupils
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(centerX - eyeXOffset - 3, eyeY-2, 4, 0, 2*Math.PI);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(centerX + eyeXOffset - 3, eyeY-2, 4, 0, 2*Math.PI);
            this.ctx.fill();
        } else {
            // Blink: draw horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - eyeXOffset - 15, eyeY);
            this.ctx.lineTo(centerX - eyeXOffset + 15, eyeY);
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + eyeXOffset - 15, eyeY);
            this.ctx.lineTo(centerX + eyeXOffset + 15, eyeY);
            this.ctx.stroke();
        }

        // Mouth (lip sync)
        const mouthHeight = 15 + this.mouthOpen * 35;
        const mouthY = centerY + 30;
        this.ctx.fillStyle = '#c0392b';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, mouthY, 30, mouthHeight, 0, 0, 2*Math.PI);
        this.ctx.fill();
        // Eyebrows (emotion)
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#4a2c1a';
        if (this.emotion === 'happy') {
            this.ctx.beginPath(); this.ctx.arc(centerX - eyeXOffset - 10, eyeY-22, 12, 0.1, Math.PI - 0.1); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(centerX + eyeXOffset + 10, eyeY-22, 12, 0.1, Math.PI - 0.1); this.ctx.stroke();
        } else if (this.emotion === 'sad') {
            this.ctx.beginPath(); this.ctx.arc(centerX - eyeXOffset - 10, eyeY-12, 12, Math.PI, 2*Math.PI-0.1); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(centerX + eyeXOffset + 10, eyeY-12, 12, Math.PI, 2*Math.PI-0.1); this.ctx.stroke();
        } else {
            this.ctx.beginPath(); this.ctx.moveTo(centerX - eyeXOffset - 20, eyeY-20); this.ctx.lineTo(centerX - eyeXOffset, eyeY-28); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.moveTo(centerX + eyeXOffset + 20, eyeY-20); this.ctx.lineTo(centerX + eyeXOffset, eyeY-28); this.ctx.stroke();
        }
        if (this.userImage) {
            // overlay user photo as small inset or texture mapping
            this.ctx.drawImage(this.userImage, centerX-40, centerY+70, 80, 80);
        }
    }

    generateDefaultAvatar(gender) {
        // placeholder
        return null;
    }
}
