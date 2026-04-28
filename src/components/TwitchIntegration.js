import { NotificationManager } from './NotificationManager.js'

class TwitchIntegration {
  constructor(streamContainerId, clipsContainerId) {
    this.banner = document.getElementById('twitch-banner');
    this.status = document.getElementById('twitch-status');
    this.detail = document.getElementById('twitch-detail');
    this.cta = document.getElementById('twitch-cta');
    this.ctaLabel = document.getElementById('twitch-cta-label');
    this.streamContainer = document.getElementById(streamContainerId);
    this.clipsContainer = document.getElementById(clipsContainerId);
    this.clips = [];
    this.currentClipIndex = 0;
  }

  async init() {
    try {
      const data = await this.fetchTwitchData();
      this.updateBanner(data);
      this.updateStream(data);
      this.clips = data.clips || [];
      this.renderClip(0);
      this.cta?.addEventListener('click', () => {
        if (this.cta.dataset.href) window.open(this.cta.dataset.href, '_blank', 'noopener,noreferrer');
      });
      document.getElementById('clip-prev')?.addEventListener('click', () => this.cycleClip(-1));
      document.getElementById('clip-next')?.addEventListener('click', () => this.cycleClip(1));
      setInterval(() => this.checkLiveStatus(), 120000);
    } catch (e) {
      console.error('Twitch init failed:', e);
      this.streamContainer.innerHTML = '<div class="twitch-offline-msg"><p>Unable to load stream data. Please try again later.</p></div>';
    }
  }

  async fetchTwitchData() {
    const res = await fetch('/.netlify/functions/Twitch');
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  }

  updateBanner(data) {
    if (data.isLive) {
      this.banner.className = 'twitch-banner twitch-banner--live';
      this.status.textContent = 'Currently Live';
      this.detail.textContent = `${data.stream.title} · ${data.stream.viewer_count.toLocaleString()} viewers`;
      this.ctaLabel.textContent = 'Watch on Twitch';
      this.cta.dataset.href = 'https://www.twitch.tv/yozora';
    } else {
      this.banner.className = 'twitch-banner twitch-banner--offline';
      this.status.textContent = 'Offline';
      this.detail.textContent = data.videos[0] ? `Last stream: ${data.videos[0].title}` : 'No recent streams';
      this.ctaLabel.textContent = 'Watch the last VOD';
      this.cta.dataset.href = data.videos[0]?.url ?? 'https://www.twitch.tv/yozora';
    }
  }

  updateStream(data) {
    const vodLabel = document.getElementById('vod-label');
    if (data.isLive) {
      if (vodLabel) vodLabel.textContent = '🔴 Live Stream';
      this.embed(`channel=${data.broadcaster.login}`);
    } else if (data.videos.length > 0) {
      if (vodLabel) vodLabel.textContent = 'Latest VOD';
      this.embed(`video=${data.videos[0].id}`);
    } else {
      if (vodLabel) vodLabel.textContent = '';
      this.streamContainer.innerHTML = '<div class="twitch-offline-msg"><p>No recent VOD available.</p></div>';
    }
  }

  embed(param) {
    const width = this.streamContainer.offsetWidth;
    const height = Math.round(width * (9 / 16));
    this.streamContainer.innerHTML = `<iframe src="https://player.twitch.tv/?${param}&parent=${window.location.hostname}&muted=false" height="${height}" width="${width}" allowfullscreen></iframe>`;
  }

  renderClip(index) {
    if (!this.clips.length) {
      this.clipsContainer.innerHTML = '<p class="text-center p-4">No recent clips available</p>';
      return;
    }
    const clip = this.clips[index];
    const width = this.clipsContainer.offsetWidth;
    const height = Math.round(width * (3 / 4));
    this.clipsContainer.innerHTML = `<iframe src="https://clips.twitch.tv/embed?clip=${clip.id}&parent=${window.location.hostname}" height="${height}" width="${width}" allowfullscreen></iframe>`;
    const titleEl = document.getElementById('clip-title');
    const counterEl = document.getElementById('clip-counter');
    if (titleEl) titleEl.textContent = clip.title;
    if (counterEl) counterEl.textContent = `${index + 1} / ${this.clips.length}`;
  }

  cycleClip(direction) {
    if (!this.clips.length) return;
    this.currentClipIndex = (this.currentClipIndex + direction + this.clips.length) % this.clips.length;
    this.renderClip(this.currentClipIndex);
  }

  async checkLiveStatus() {
    try {
      const data = await this.fetchTwitchData();
      const wasLive = this.banner.classList.contains('twitch-banner--live');
      this.updateBanner(data);
      if (data.isLive && !wasLive) {
        this.updateStream(data);
        NotificationManager.send('Yozora is now live!', { body: 'Click to watch the stream', icon: '/icon/twitch.svg' });
      }
    } catch (e) {
      console.error('Live check failed:', e);
    }
  }
}

export { TwitchIntegration };