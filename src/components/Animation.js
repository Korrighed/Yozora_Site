export class ImageAnimation {
    constructor(selector, images, interval = 3000) {
        this.selector = selector;
        this.images = images; // Array of image paths
        this.interval = interval; // Time in milliseconds
        this.currentIndex = 0;
        this.imgElement = null;
        this.intervalId = null;
    }

    init() {
        this.imgElement = document.querySelector(this.selector);

        if (!this.imgElement) {
            console.error(`Element with selector "${this.selector}" not found`);
            return;
        }

        // Start the animation
        this.start();
    }

    switchImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.imgElement.src = this.images[this.currentIndex];
    }

    start() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        this.intervalId = setInterval(() => {
            this.switchImage();
        }, this.interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    static create(selector, images, interval) {
        const animation = new ImageAnimation(selector, images, interval);
        animation.init();
        return animation;
    }
}