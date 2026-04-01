class TwitchIntegration {
  constructor(streamContainerId, clipsContainerId) {
    this.streamContainer = document.getElementById(streamContainerId);
    this.clipsContainer = document.getElementById(clipsContainerId);
    this.clips = [];
    this.currentClipIndex = 0;
  }

  async init() {
    try {
      const data = await this.fetchTwitchData();

      this.updateBanner(data);

      if (data.isLive) {
        this.setVodLabel('🔴 Live Stream');
        this.embedLiveStream(data.broadcaster.login);
      } else if (data.videos.length > 0) {
        this.setVodLabel('Latest VOD');
        this.embedVOD(data.videos[0].id);
      } else {
        this.setVodLabel('');
        this.showOfflineMessage();
      }

      this.clips = data.clips || [];
      this.renderClip(0);

      document.getElementById('clip-prev')?.addEventListener('click', () => this.cycleClip(-1));
      document.getElementById('clip-next')?.addEventListener('click', () => this.cycleClip(1));

      setInterval(() => this.checkLiveStatus(), 120000);

    } catch (error) {
      console.error('Failed to initialize Twitch:', error);
      this.showError();
    }
  }

  async fetchTwitchData() {
    const response = await fetch('/.netlify/functions/Twitch');
    if (!response.ok) throw new Error('Failed to fetch Twitch data');
    return response.json();
  }

  updateBanner(data) {
    const dot = document.querySelector('.twitch-banner__status-dot');
    const marquee = document.querySelector('.twitch-banner__marquee');
    const bannerLink = document.getElementById('twitch-banner-link');

    let labelText, detailText, linkText;

    if (data.isLive) {
      dot?.classList.add('twitch-banner__status-dot--live');
      labelText = 'Currently Live';
      detailText = `${data.stream.title} · ${data.stream.viewer_count.toLocaleString()} viewers`;
      linkText = 'Watch on Twitch';
    } else {
      dot?.classList.remove('twitch-banner__status-dot--live');
      labelText = 'Offline';
      detailText = data.videos.length > 0
        ? `Last stream: ${data.videos[0].title}`
        : 'No recent streams';
      linkText = 'Visit Twitch Channel';
    }

    // Duplicate content for seamless loop
    const segment = `<span class="twitch-banner__label">${labelText}</span><span class="twitch-banner__detail">${detailText}</span>`;
    marquee.innerHTML = segment + segment;

    bannerLink.dataset.label = linkText;
  }

  setVodLabel(text) {
    const el = document.getElementById('vod-label');
    if (el) el.textContent = text;
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

  renderClip(index) {
    if (this.clips.length === 0) {
      this.clipsContainer.innerHTML = '<p class="text-center p-4">No recent clips available</p>';
      return;
    }

    const clip = this.clips[index];
    this.clipsContainer.innerHTML = `
      <iframe
        src="https://clips.twitch.tv/embed?clip=${clip.id}&parent=${window.location.hostname}"
        height="100%"
        width="100%"
        allowfullscreen>
      </iframe>
    `;

    const titleEl = document.getElementById('clip-title');
    const counterEl = document.getElementById('clip-counter');

    if (titleEl) titleEl.textContent = clip.title;
    if (counterEl) counterEl.textContent = `${index + 1} / ${this.clips.length}`;

    // view count hidden for now — can be toggled back on
    // const viewsEl = document.getElementById('clip-views');
    // if (viewsEl) viewsEl.textContent = `${clip.view_count.toLocaleString()} views`;
  }

  cycleClip(direction) {
    if (this.clips.length === 0) return;
    this.currentClipIndex = (this.currentClipIndex + direction + this.clips.length) % this.clips.length;
    this.renderClip(this.currentClipIndex);
  }

  showOfflineMessage() {
    this.streamContainer.innerHTML = `
      <div class="twitch-offline-msg">
        <p>No recent VOD available.</p>
      </div>
    `;
  }

  showError() {
    this.streamContainer.innerHTML = `
      <div class="twitch-offline-msg">
        <p>Unable to load stream data. Please try again later.</p>
      </div>
    `;
  }

  async checkLiveStatus() {
    try {
      const data = await this.fetchTwitchData();
      const wasLive = document.querySelector('.twitch-banner__status-dot--live') !== null;

      this.updateBanner(data);

      if (data.isLive && !wasLive) {
        this.setVodLabel('🔴 Live Stream');
        this.embedLiveStream(data.broadcaster.login);
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