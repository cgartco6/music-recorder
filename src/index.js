import BackgroundRecorder from './background-recorder';
import LyricsExtractor from './lyrics-extractor';
import BPMDetector from './bpm-detector';
import GenreClassifier from './genre-classifier';
import InstrumentDetector from './instrument-detector';
import LongTermMemory from './longterm-memory';
import DownloadManager from './download-manager';
import './styles.css';

class MusicRecorderApp {
    constructor() {
        this.recorder = new BackgroundRecorder();
        this.lyricsExtractor = new LyricsExtractor();
        this.bpmDetector = new BPMDetector();
        this.genreClassifier = new GenreClassifier();
        this.instrumentDetector = new InstrumentDetector();
        this.memory = new LongTermMemory();
        this.downloadManager = new DownloadManager();
        this.isRecording = false;
        this.currentRecordingId = null;
        this.init();
    }

    async init() {
        await this.memory.init();
        await this.recorder.init();
        this.render();
        this.setupEventListeners();
        await this.loadHistory();
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="header">
                <h1>🎵 Music Recorder HD</h1>
                <div class="controls">
                    <button id="startBtn" class="btn-primary">🎤 Start Recording</button>
                    <button id="stopBtn" class="btn-danger" disabled>⏹️ Stop Recording</button>
                    <button id="downloadBtn" class="btn-success" disabled>💾 Download Last Recording</button>
                </div>
                <div id="status" class="status">Ready to record...</div>
            </div>
            <div class="info-grid">
                <div class="info-card">
                    <h3>🎵 Real-time Analysis</h3>
                    <div id="bpm">BPM: --</div>
                    <div id="genre">Genre: --</div>
                    <div id="instruments">Instruments: --</div>
                </div>
                <div class="info-card">
                    <h3>📝 Lyrics</h3>
                    <div id="lyrics">Waiting for audio...</div>
                </div>
                <div class="info-card">
                    <h3>📚 Recording History</h3>
                    <div id="history" class="recording-list"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadLastRecording());
    }

    async startRecording() {
        try {
            await this.recorder.start();
            this.isRecording = true;
            this.currentRecordingId = Date.now().toString();
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            document.getElementById('status').innerHTML = '🔴 Recording... (running in background)';
            document.getElementById('status').classList.add('recording');
            
            this.startAnalysis();
        } catch (error) {
            console.error('Failed to start recording:', error);
            document.getElementById('status').innerHTML = '❌ Failed to start recording. Check microphone permissions.';
        }
    }

    startAnalysis() {
        this.analysisInterval = setInterval(async () => {
            if (!this.isRecording) return;
            
            const audioData = this.recorder.getLatestAudioChunk();
            if (!audioData) return;
            
            const bpm = await this.bpmDetector.detect(audioData);
            const genre = await this.genreClassifier.classify(audioData);
            const instruments = await this.instrumentDetector.detect(audioData);
            const lyrics = await this.lyricsExtractor.extract(audioData);
            
            document.getElementById('bpm').textContent = `BPM: ${bpm}`;
            document.getElementById('genre').textContent = `Genre: ${genre}`;
            document.getElementById('instruments').textContent = `Instruments: ${instruments.join(', ')}`;
            document.getElementById('lyrics').innerHTML = `<div class="lyrics">${lyrics}</div>`;
            
            await this.memory.store(this.currentRecordingId, {
                timestamp: Date.now(),
                bpm,
                genre,
                instruments,
                lyrics,
                audioChunk: audioData
            });
        }, 2000);
    }

    async stopRecording() {
        this.isRecording = false;
        clearInterval(this.analysisInterval);
        
        const audioBlob = await this.recorder.stop();
        const finalData = await this.memory.get(this.currentRecordingId);
        
        if (finalData) {
            const completeRecording = {
                id: this.currentRecordingId,
                ...finalData,
                audioBlob,
                date: new Date().toISOString()
            };
            
            await this.memory.archiveRecording(completeRecording);
            await this.loadHistory();
            
            document.getElementById('downloadBtn').disabled = false;
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('status').innerHTML = '✅ Recording saved to memory';
        document.getElementById('status').classList.remove('recording');
        
        setTimeout(() => {
            document.getElementById('status').innerHTML = 'Ready to record...';
        }, 2000);
    }

    async loadHistory() {
        const history = await this.memory.getAllArchived();
        const historyDiv = document.getElementById('history');
        
        if (history.length === 0) {
            historyDiv.innerHTML = '<p>No recordings yet</p>';
            return;
        }
        
        historyDiv.innerHTML = history.reverse().map(rec => `
            <div class="recording-item" onclick="app.playRecording('${rec.id}')">
                <strong>${new Date(rec.date).toLocaleString()}</strong><br>
                🎵 BPM: ${rec.bpm} | Genre: ${rec.genre}<br>
                🎸 Instruments: ${rec.instruments.join(', ')}<br>
                📝 ${rec.lyrics.substring(0, 100)}...
            </div>
        `).join('');
    }

    async downloadLastRecording() {
        const recordings = await this.memory.getAllArchived();
        if (recordings.length === 0) return;
        
        const last = recordings[recordings.length - 1];
        await this.downloadManager.downloadRecording(last);
    }
}

const app = new MusicRecorderApp();
window.app = app;
