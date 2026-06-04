export default class LongTermMemory {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MusicRecorderDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                
                if (!db.objectStoreNames.contains('recordings')) {
                    const store = db.createObjectStore('recordings', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('archive')) {
                    const archive = db.createObjectStore('archive', { keyPath: 'id' });
                    archive.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    async store(id, data) {
        const transaction = this.db.transaction(['recordings'], 'readwrite');
        const store = transaction.objectStore('recordings');
        
        return new Promise((resolve, reject) => {
            const request = store.put({ id, ...data });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async get(id) {
        const transaction = this.db.transaction(['recordings'], 'readonly');
        const store = transaction.objectStore('recordings');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async archiveRecording(recording) {
        const transaction = this.db.transaction(['archive'], 'readwrite');
        const store = transaction.objectStore('archive');
        
        return new Promise((resolve, reject) => {
            const request = store.put(recording);
            request.onsuccess = () => {
                this.deleteFromRecordings(recording.id);
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFromRecordings(id) {
        const transaction = this.db.transaction(['recordings'], 'readwrite');
        const store = transaction.objectStore('recordings');
        store.delete(id);
    }

    async getAllArchived() {
        const transaction = this.db.transaction(['archive'], 'readonly');
        const store = transaction.objectStore('archive');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
}
