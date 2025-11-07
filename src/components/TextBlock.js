export class TextBlock {
    // Compteur statique pour IDs uniques
    static counter = 0;

    constructor(config) {
        this.title = config.title || '';
        this.content = config.content || '';
        this.size = config.size || 'medium'; // small, medium, large

        // ID ultra-simple avec compteur
        this.id = config.id || `text-${++TextBlock.counter}`;
    }

    render() {
        return `
      <div class="text-block text-block--${this.size}" data-id="${this.id}">
        ${this.title ? `<h3 class="text-block__title">${this.title}</h3>` : ''}
        <div class="text-block__content" contenteditable="true">
          ${this.content}
        </div>
      </div>
    `;
    }

    mount(selector) {
        const container = document.querySelector(selector);
        if (container) {
            const blockHTML = this.render();
            container.insertAdjacentHTML('beforeend', blockHTML);

            // Ajouter l'interactivité après le montage
            this.addInteractivity();
        }
        return this;
    }

    addInteractivity() {
        const element = document.querySelector(`[data-id="${this.id}"]`);
        if (!element) return;

        const contentDiv = element.querySelector('.text-block__content');

        // Sauvegarde automatique lors de l'édition
        contentDiv.addEventListener('blur', () => {
            this.content = contentDiv.innerHTML;
            console.log(`Contenu mis à jour pour le bloc ${this.id}:`, this.content);
        });

        // Effet au survol
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.02)';
            element.style.transition = 'all 0.3s ease';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    }

    // Méthode pour changer le contenu
    updateContent(newContent) {
        this.content = newContent;
        const element = document.querySelector(`[data-id="${this.id}"]`);
        if (element) {
            const contentDiv = element.querySelector('.text-block__content');
            contentDiv.innerHTML = newContent;
        }
    }

    // Méthode pour changer la taille
    changeSize(newSize) {
        this.size = newSize;
        const element = document.querySelector(`[data-id="${this.id}"]`);
        if (element) {
            element.className = `text-block text-block--${newSize}`;
        }
    }

    static create(config) {
        return new TextBlock(config);
    }

    // Méthodes statiques pour créer des types spécifiques
    static createTitle(config) {
        return new TextBlock({ ...config, size: 'large' });
    }

    static createText(config) {
        return new TextBlock({ ...config, size: 'medium' });
    }
}
