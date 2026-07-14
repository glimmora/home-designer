// Real-time collaboration via BroadcastChannel API
// Works across browser tabs/windows on the same origin (no backend needed)
// For true multi-user collaboration, would need a WebSocket server

const CHANNEL_NAME = 'home-designer-pro-collab';
const USER_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
const USER_NAMES = ['Anggur', 'Mangga', 'Jeruk', 'Pisang', 'Semangka', 'Stroberi', 'Nanas', 'Kiwi'];

class CollaborationManager {
  constructor() {
    this.channel = null;
    this.userId = null;
    this.userName = null;
    this.userColor = null;
    this.isActive = false;
    this.peers = new Map(); // userId -> { name, color, lastSeen, cursor }
    this.callbacks = {
      onPeerJoin: [],
      onPeerLeave: [],
      onPeerCursor: [],
      onProjectSync: [],
      onMessage: [],
    };
    this.heartbeatInterval = null;
  }

  // Initialize collaboration with random user identity
  join(name = null) {
    if (this.isActive) return;
    if (typeof BroadcastChannel === 'undefined') {
      throw new Error('BroadcastChannel tidak didukung browser ini');
    }

    this.userId = 'user-' + Math.random().toString(36).slice(2, 9);
    const idx = Math.floor(Math.random() * USER_NAMES.length);
    this.userName = name || USER_NAMES[idx] + '-' + this.userId.slice(-3);
    this.userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    this.isActive = true;

    this.channel = new BroadcastChannel(CHANNEL_NAME);

    this.channel.onmessage = (e) => this.handleMessage(e.data);

    // Announce join
    this.broadcast({
      type: 'join',
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      timestamp: Date.now(),
    });

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'heartbeat',
        userId: this.userId,
        userName: this.userName,
        userColor: this.userColor,
        timestamp: Date.now(),
      });
      // Clean stale peers (no heartbeat in 5s)
      const now = Date.now();
      for (const [id, peer] of this.peers) {
        if (now - peer.lastSeen > 5000) {
          this.peers.delete(id);
          this.callbacks.onPeerLeave.forEach((cb) => cb(id));
        }
      }
    }, 2000);

    return { userId: this.userId, userName: this.userName, userColor: this.userColor };
  }

  leave() {
    if (!this.isActive) return;
    this.broadcast({
      type: 'leave',
      userId: this.userId,
      timestamp: Date.now(),
    });
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.channel) this.channel.close();
    this.isActive = false;
    this.peers.clear();
    this.channel = null;
  }

  broadcast(message) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  handleMessage(data) {
    if (data.userId === this.userId) return; // skip own

    switch (data.type) {
      case 'join':
      case 'heartbeat':
        const isNew = !this.peers.has(data.userId);
        this.peers.set(data.userId, {
          name: data.userName,
          color: data.userColor,
          lastSeen: Date.now(),
          cursor: this.peers.get(data.userId)?.cursor || null,
        });
        if (isNew) {
          this.callbacks.onPeerJoin.forEach((cb) => cb(data.userId, data.userName, data.userColor));
          // Send our info back so they know about us
          this.broadcast({
            type: 'heartbeat',
            userId: this.userId,
            userName: this.userName,
            userColor: this.userColor,
            timestamp: Date.now(),
          });
        }
        break;

      case 'leave':
        if (this.peers.has(data.userId)) {
          this.peers.delete(data.userId);
          this.callbacks.onPeerLeave.forEach((cb) => cb(data.userId));
        }
        break;

      case 'cursor':
        const peer = this.peers.get(data.userId);
        if (peer) {
          peer.cursor = { x: data.x, y: data.y, mode: data.mode };
          this.callbacks.onPeerCursor.forEach((cb) => cb(data.userId, peer, data.x, data.y, data.mode));
        }
        break;

      case 'project-sync':
        this.callbacks.onProjectSync.forEach((cb) => cb(data.project, data.userId, data.userName));
        break;

      case 'message':
        this.callbacks.onMessage.forEach((cb) => cb(data.userId, data.userName, data.userColor, data.text));
        break;
    }
  }

  // Send cursor position to peers
  sendCursor(x, y, mode) {
    if (!this.isActive) return;
    this.broadcast({
      type: 'cursor',
      userId: this.userId,
      x,
      y,
      mode,
      timestamp: Date.now(),
    });
  }

  // Send project state to peers
  sendProjectSync(project) {
    if (!this.isActive) return;
    this.broadcast({
      type: 'project-sync',
      userId: this.userId,
      userName: this.userName,
      project,
      timestamp: Date.now(),
    });
  }

  // Send chat message
  sendMessage(text) {
    if (!this.isActive) return;
    this.broadcast({
      type: 'message',
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      text,
      timestamp: Date.now(),
    });
  }

  // Event subscriptions
  on(event, callback) {
    if (this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`].push(callback);
    }
  }

  off(event, callback) {
    const key = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (this.callbacks[key]) {
      this.callbacks[key] = this.callbacks[key].filter((cb) => cb !== callback);
    }
  }

  getPeers() {
    return Array.from(this.peers.entries()).map(([id, p]) => ({ id, ...p }));
  }

  getInfo() {
    return {
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      isActive: this.isActive,
      peerCount: this.peers.size,
    };
  }
}

// Singleton instance
export const collab = new CollaborationManager();
