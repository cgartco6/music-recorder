export default class LongTermMemory {
    async init() {
        return new Promise((resolve) => {
            const req = indexedDB.open('MusicProDB', 2);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('archive')) db.createObjectStore('archive', { keyPath: 'id' });
            };
            req.onsuccess = () => { this.db = req.result; resolve(); };
        });
    }
    storeChunk(sessionId, data) { /* ... */ }
    getSession(id) { /* ... */ }
    async archive(rec) {
        const tx = this.db.transaction(['archive'], 'readwrite');
        tx.objectStore('archive').put(rec);
    }
    async getAllArchived() {
        const tx = this.db.transaction(['archive'], 'readonly');
        return await tx.objectStore('archive').getAll();
    }
}
