export default class DownloadManager {
    async downloadRecording(recording) {
        const metadata = {
            title: `Recording_${new Date(recording.date).toISOString()}`,
            bpm: recording.bpm,
            genre: recording.genre,
            instruments: recording.instruments,
            lyrics: recording.lyrics,
            timestamp: recording.date
        };
        
        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const audioBlob = recording.audioBlob;
        
        this.downloadBlob(audioBlob, `${metadata.title}.wav`);
        setTimeout(() => {
            this.downloadBlob(metadataBlob, `${metadata.title}_metadata.json`);
        }, 100);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
