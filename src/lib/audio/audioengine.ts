import { writable, derived, get } from 'svelte/store';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  url: string;
  duration?: number;
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  isAutoplay: boolean;
}


class AudioEngine {
  private audio: HTMLAudioElement;
  private state = writable<AudioState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    isAutoplay: true,
  });

  public readonly store = { subscribe: this.state.subscribe };

  constructor() {
    this.audio = new Audio();
    this.setupEventListeners();
    this.setupMediaSession();
  }

  private setupEventListeners() {
    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: this.audio.currentTime });
    });

    this.audio.addEventListener('durationchange', () => {
      this.updateState({ duration: this.audio.duration });
    });

    this.audio.addEventListener('volumechange', () => {
      this.updateState({
        volume: this.audio.volume,
        isMuted: this.audio.muted
      });
    });

    this.audio.addEventListener('loadstart', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });

    this.audio.addEventListener('ended', () => {
      this.onTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.updateState({ isLoading: false, isPlaying: false });
    });
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    }
  }

  private updateMediaSession(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || '',
        artwork: track.artwork ? [
          { src: track.artwork, sizes: '96x96', type: 'image/png' },
          { src: track.artwork, sizes: '128x128', type: 'image/png' },
          { src: track.artwork, sizes: '256x256', type: 'image/png' },
          { src: track.artwork, sizes: '512x512', type: 'image/png' }
        ] : []
      });
    }
  }

  private updateState(partial: Partial<AudioState>) {
    this.state.update(state => ({ ...state, ...partial }));
  }


  async load(track: Track) {
    this.audio.src = track.url;
    this.updateState({ currentTrack: track, isLoading: true });
    this.updateMediaSession(track);

    try {
      await this.audio.load();
    } catch (error) {
      console.error('Failed to load track:', error);
    }
  }

  async play() {
    try {
      await this.audio.play();
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    const { isPlaying } = get(this.state);
    if (isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time: number) {
    this.audio.currentTime = time;
  }

  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
  }

  private playlist: Track[] = [];
  private currentIndex = -1;

  setPlaylist(tracks: Track[], startIndex = 0) {
    this.playlist = tracks;
    this.currentIndex = startIndex;
    if (tracks[startIndex]) {
      this.load(tracks[startIndex]);
    }
  }

  next() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.load(this.playlist[this.currentIndex]);
      this.play();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.load(this.playlist[this.currentIndex]);
      this.play();
    }
  }

  private onTrackEnded() {
    if (get(this.store).isAutoplay) {
      this.next();
    }
  }
  destroy() {
    this.audio.pause();
    this.audio.src = '';
  }
}

export const audioEngine = new AudioEngine();
