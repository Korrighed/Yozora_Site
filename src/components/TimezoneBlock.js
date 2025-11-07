export class TimezoneBlock {
    // Compteur statique pour IDs uniques
    static counter = 0;

    constructor(config) {
        this.title = config.title || 'Informations temporelles';
        this.className = config.className || '';

        // ID simple pour timezone
        this.id = config.id || `timezone-${++TimezoneBlock.counter}`;

        // Auto-update toutes les secondes
        this.startAutoUpdate();
    }

    generateTimezoneContent() {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTime = now.toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return `
            <div class="timezone-info">
                <div class="timezone-info__item">
                    <strong>Fuseau horaire :</strong> ${timeZone}
                </div>
                <div class="timezone-info__item">
                    <strong>Heure locale :</strong> ${localTime}
                </div>
                <div class="timezone-info__item">
                    <strong>UTC :</strong> ${now.toUTCString()}
                </div>
            </div>
        `;
    }

    render() {
        return `
      <div class="text-block text-block--small ${this.className}" data-id="${this.id}">
        ${this.title ? `<h3 class="text-block__title">${this.title}</h3>` : ''}
        <div class="text-block__content">
          ${this.generateTimezoneContent()}
        </div>
      </div>
    `;
    }

    mount(selector) {
        const container = document.querySelector(selector);
        if (container) {
            const blockHTML = this.render();
            container.insertAdjacentHTML('beforeend', blockHTML);

            // Ajouter l'interactivité
            this.addInteractivity();
        }
        return this;
    }

    addInteractivity() {
        const element = document.querySelector(`[data-id="${this.id}"]`);
        if (!element) return;

        // Effet au survol
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.02)';
            element.style.transition = 'all 0.3s ease';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    }

    updateContent() {
        const element = document.querySelector(`[data-id="${this.id}"]`);
        if (element) {
            const contentDiv = element.querySelector('.text-block__content');
            contentDiv.innerHTML = this.generateTimezoneContent();
        }
    }

    startAutoUpdate() {
        // Met à jour toutes les secondes
        setInterval(() => {
            this.updateContent();
        }, 1000);
    }

    static create(config) {
        return new TimezoneBlock(config);
    }
}