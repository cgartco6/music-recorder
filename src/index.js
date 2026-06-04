
### `src/index.js` (complete)
```javascript
import BackgroundRecorder from './background-recorder';
import NoiseCanceller from './noise-canceller';
import BPMDetector from './bpm-detector';
import GenreClassifier from './genre-classifier';
import InstrumentDetector from './instrument-detector';
import LyricsExtractor from './lyrics-extractor';
import CharacterAI from './character-ai';
import CharacterRenderer from './character-renderer';
import InstrumentVisualizer from './instrument-visualizer';
import LongTermMemory from './longterm-memory';
import DownloadManager from './download-manager';
import SongMatcher from './song-matcher';
import './styles.css';

class MusicRecorderPro {
    constructor() {
        this.recorder = new BackgroundRecorder();
        this.noiseCanceller = new NoiseCanceller();
        this.bpmDetector = new BPMDetector();
        this.genreClassifier = new GenreClassifier();
        this.instrumentDetector = new InstrumentDetector();
        this.lyricsExtractor = new LyricsExtractor();
        this.characterAI = new CharacterAI();
        this.characterRenderer = new CharacterRenderer();
        this.instrumentVisualizer = new InstrumentVisualizer();
        this.memory = new LongTermMemory();
        this.downloader = new DownloadManager();
        this.songMatcher = new SongMatcher();
        this.isRecording = false;
        this.currentSessionId = null;
        this.analysisInterval = null;
        this.init();
    }

    async init() {
        await this.memory.init();
        await this.recorder.init();
        await this.noiseCanceller.init();
        this.render();
        this.attachEvents();
        await this.loadHistory();
        this.characterRenderer.startAnimationLoop();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="header">
                <h1>🎤 AI Music Recorder Pro</h1>
                <div class="controls">
                    <button id="recordBtn" class="btn-rec">🔴 Start Recording</button>
                    <button id="stopBtn" class="btn-stop" disabled>⏹️ Stop</button>
                    <button id="downloadBtn" class="btn-download" disabled>💾 Download Last</button>
                    <input type="file" id="photoUpload" accept="image/*" style="display:none" />
                    <button id="uploadPhotoBtn" class="btn-upload">📸 Upload Singer Photo</button>
                    <select id="singerGender">
                        <option value="female">Female Singer</option>
                        <option value="male">Male Singer</option>
                    </select>
                </div>
                <div id="statusMsg" class="status">Ready. Allow microphone.</div>
            </div>
            <div class="grid-2col">
                <div class="card">
                    <h3>🎭 AI Character (Lip-sync + Emotions)</h3>
                    <canvas id="characterCanvas" class="character-canvas" width="500" height="500"></canvas>
                    <div>Click on canvas to change expression | Eyes blink automatically</div>
                </div>
                <div class="card">
                    <h3>🎵 Real-time Analysis</h3>
                    <div><strong>BPM:</strong> <span id="bpmVal">--</span></div>
                    <div><strong>Genre:</strong> <span id="genreVal">--</span></div>
                    <div><strong>Instruments:</strong> <span id="instrumentsVal">--</span></div>
                    <div><strong>Lyrics:</strong> <div id="lyricsBox" style="background:#f0f0f0; padding:10px; border-radius:16px; margin-top:10px;">--</div></div>
                    <div id="instrumentIcons" class="instruments-panel"></div>
                </div>
            </div>
            <div class="card">
                <h3>📀 Recordings History (Exact song replication)</h3>
                <div id="historyList" class="recording-list"></div>
            </div>
        `;
        this.characterRenderer.attachCanvas(document.getElementById('characterCanvas'));
    }

    attachEvents() {
        document.getElementById('recordBtn').onclick = () => this.startRecording();
        document.getElementById('stopBtn').onclick = () => this.stopRecording();
        document.getElementById('downloadBtn').onclick = () => this.downloadLast();
        document.getElementById('uploadPhotoBtn').onclick = () => document.getElementById('photoUpload').click();
        document.getElementById('photoUpload').onchange = (e) => this.handlePhotoUpload(e);
        document.getElementById('singerGender').onchange = (e) => this.characterAI.setGender(e.target.value);
        document.getElementById('characterCanvas').onclick = () => this.characterAI.triggerRandomExpression();
    }

    async startRecording() {
        try {
            await this.recorder.start();
            this.isRecording = true;
            this.currentSessionId = Date.now().toString();
            document.getElementById('recordBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('statusMsg').innerHTML = '🔴 Recording + Noise Cancellation ACTIVE';
            document.getElementById('statusMsg').classList.add('recording');
            this.startAnalysisLoop();
        } catch(e) {
            alert('Microphone error: ' + e.message);
        }
    }

    startAnalysisLoop() {
        this.analysisInterval = setInterval(async () => {
            if (!this.isRecording) return;
            let rawChunk = this.recorder.getLatestAudioChunk();
            if (!rawChunk) return;
            const cleanChunk = await this.noiseCanceller.process(rawChunk);
            const bpm = await this.bpmDetector.detect(cleanChunk);
            const genre = await this.genreClassifier.classify(cleanChunk);
            const instruments = await this.instrumentDetector.detect(cleanChunk);
            const lyrics = await this.lyricsExtractor.extract(cleanChunk);
            document.getElementById('bpmVal').innerText = bpm;
            document.getElementById('genreVal').innerText = genre;
            document.getElementById('instrumentsVal').innerText = instruments.join(', ');
            document.getElementById('lyricsBox').innerHTML = `<em>${lyrics}</em>`;
            this.instrumentVisualizer.render(instruments, document.getElementById('instrumentIcons'));
            const energy = this.computeEnergy(cleanChunk);
            this.characterAI.updateLipSync(energy);
            this.characterRenderer.updateExpression(this.characterAI.getCurrentMouthOpen(), this.characterAI.getCurrentEmotion());
            await this.memory.storeChunk(this.currentSessionId, {
                timestamp: Date.now(),
                bpm, genre, instruments, lyrics, cleanChunk
            });
            const match = await this.songMatcher.match(cleanChunk, bpm, genre);
            if (match.confidence > 0.8) {
                document.getElementById('statusMsg').innerHTML = `🎯 Exact match: ${match.songTitle || 'Unknown'} | Recording...`;
            }
        }, 1800);
    }

    computeEnergy(buffer) {
        let sum = 0;
        for (let i=0; i<buffer.length; i++) sum += Math.abs(buffer[i]);
        return Math.min(1, sum / buffer.length * 5);
    }

    async stopRecording() {
        this.isRecording = false;
        clearInterval(this.analysisInterval);
        const audioBlob = await this.recorder.stop();
        const finalCleanBlob = await this.noiseCanceller.offlineProcess(audioBlob);
        const sessionData = await this.memory.getSession(this.currentSessionId);
        const finalRecording = {
            id: this.currentSessionId,
            date: new Date().toISOString(),
            audioBlob: finalCleanBlob,
            metadata: sessionData,
            exactLyrics: sessionData?.lyrics || "Full lyrics extracted",
            genreStats: sessionData?.genre
        };
        await this.memory.archive(finalRecording);
        await this.loadHistory();
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('statusMsg').innerHTML = '✅ Recording saved (noise removed)';
        document.getElementById('statusMsg').classList.remove('recording');
    }

    async downloadLast() {
        const archives = await this.memory.getAllArchived();
        if (archives.length) {
            this.downloader.downloadRecording(archives[archives.length-1]);
        }
    }

    async loadHistory() {
        const list = await this.memory.getAllArchived();
        const container = document.getElementById('historyList');
        if (!list.length) { container.innerHTML = '<p>No recordings yet</p>'; return; }
        container.innerHTML = list.reverse().map(rec => `
            <div style="background:white; margin:8px; padding:12px; border-radius:16px;">
                <strong>${new Date(rec.date).toLocaleString()}</strong><br>
                🎵 ${rec.metadata?.genre} | BPM ${rec.metadata?.bpm}<br>
                🎸 ${rec.metadata?.instruments?.join(', ')}<br>
                📝 ${rec.exactLyrics.substring(0,120)}...
                <button onclick="window.app.playRecording('${rec.id}')">▶️ Play</button>
            </div>
        `).join('');
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.characterAI.setUserPhoto(e.target.result);
                this.characterRenderer.loadTexture(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

window.app = new MusicRecorderPro();
window.app.playRecording = async (id) => {
    const archives = await window.app.memory.getAllArchived();
    const rec = archives.find(r => r.id === id);
    if (rec && rec.audioBlob) {
        const url = URL.createObjectURL(rec.audioBlob);
        const audio = new Audio(url);
        audio.play();
    }
};
