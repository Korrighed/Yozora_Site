// Twitch embed player management
class TwitchIntegration {
    constructor(streamContainerId, clipsContainerId) {
        this.streamContainer = document.getElementById(streamContainerId);
        this.clipsContainer = document.getElementById(clipsContainerId);
        this.currentEmbed = null;
    }

    async init() {
        try {
            const data = await this.fetchTwitchData();

            if (data.isLive) {
                this.embedLiveStream(data.broadcaster.login);
                this.showLiveIndicator(data.stream);
            } else if (data.videos.length > 0) {
                this.embedVOD(data.videos[0].id);
            } else {
                this.showOfflineMessage();
            }

            this.displayClips(data.clips);

            // Check every 2 minutes for live status
            setInterval(() => this.checkLiveStatus(), 120000);

        } catch (error) {
            console.error('Failed to initialize Twitch:', error);
            this.showError();
        }
    }

    async fetchTwitchData() {
        const response = await fetch('/.netlify/functions/twitch');

        if (!response.ok) {
            throw new Error('Failed to fetch Twitch data');
        }

        return await response.json();
    }

    embedLiveStream(channel) {
        this.streamContainer.innerHTML = `
      <iframe
        src="https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=false"
        height="100%"
        width="100%"
        allowfullscreen>
      </iframe>
    `;
    }

    embedVOD(videoId) {
        this.streamContainer.innerHTML = `
      <iframe
        src="https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}&muted=false"
        height="100%"
        width="100%"
        allowfullscreen>
      </iframe>
    `;
    }

    displayClips(clips) {
        if (clips.length === 0) {
            this.clipsContainer.innerHTML = '<p class="text-center">No clips available</p>';
            return;
        }

        this.clipsContainer.innerHTML = clips.map(clip => `
      <div class="clip-item" style="width: ${100 / clips.length}%;">
        <iframe
          src="https://clips.twitch.tv/embed?clip=${clip.id}&parent=${window.location.hostname}"
          height="100%"
          width="100%"
          allowfullscreen>
        </iframe>
        <p class="clip-title">${clip.title}</p>
        <small>${clip.view_count.toLocaleString()} views</small>
      </div>
    `).join('');
    }

    showLiveIndicator(stream) {
        const indicator = document.createElement('div');
        indicator.className = 'live-indicator';
        indicator.innerHTML = `
      <span class="live-badge">🔴 LIVE</span>
      <span>${stream.viewer_count.toLocaleString()} viewers</span>
      <p>${stream.title}</p>
    `;
        this.streamContainer.prepend(indicator);
    }

    showOfflineMessage() {
        this.streamContainer.innerHTML = `
      <div class="offline-message text-center p-5">
        <h3>Yozora is currently offline</h3>
        <p>Check back soon for the next stream!</p>
      </div>
    `;
    }

    showError() {
        this.streamContainer.innerHTML = `
      <div class="error-message text-center p-5">
        <p>Unable to load stream data. Please try again later.</p>
      </div>
    `;
    }

    async checkLiveStatus() {
        try {
            const data = await this.fetchTwitchData();
            const wasLive = this.currentEmbed === 'live';

            if (data.isLive && !wasLive) {
                // Stream just went live!
                this.embedLiveStream(data.broadcaster.login);
                this.showLiveIndicator(data.stream);
                this.currentEmbed = 'live';

                // Optional: Show notification
                this.showLiveNotification();
            }
        } catch (error) {
            console.error('Live check failed:', error);
        }
    }

    showLiveNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Yozora is now live!', {
                body: 'Click to watch the stream',
                icon: '/Yozo_Full.png'
            });
        }
    }
}

export { TwitchIntegration };
