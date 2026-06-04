export default class InstrumentVisualizer {
    render(instruments, containerElement) {
        const iconMap = {
            'Drums': '🥁', 'Guitar': '🎸', 'Piano': '🎹', 'Bass': '🎻', 'Vocals': '🎤', 'Synthesizer': '🎛️'
        };
        containerElement.innerHTML = instruments.map(inst => `
            <div class="instrument-icon">
                ${iconMap[inst] || '🎵'} ${inst}
            </div>
        `).join('');
    }
}
