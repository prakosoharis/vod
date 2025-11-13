# 🎥 Deluwang Live Streaming Implementation

## 📋 **IMPLEMENTATION STATUS: ✅ COMPLETED**

Live streaming untuk Deluwang telah berhasil diimplementasikan dengan Docker!

---

## 🏗️ **ARSITEKTUR YANG TERSEDIA:**

### **1. Docker Services**
- **Nginx-RTMP Server** (`localhost:1935`) → RTMP ingestion
- **HLS Streaming** (`localhost:8080`) → Video playback
- **Live Chat Server** (`localhost:3007`) → Real-time chat dengan Socket.IO

### **2. Nginx Configuration**
- **Subdomain**: `live.deluwang.online` → Proxy ke Docker containers
- **Endpoints**:
  - RTMP: `rtmp://live.deluwang.online/live/[STREAM_KEY]`
  - HLS: `http://live.deluwang.online/hls/[STREAM_KEY].m3u8`
  - Chat: `http://live.deluwang.online:3007`

### **3. Frontend Integration**
- Component HTML siap pakai di `/var/www/vod/livestreaming-component.html`
- API endpoints example di `/var/www/vod/rtmp/api-example.js`

---

## 🚀 **CARA MENGGUNAKAN:**

### **A. Untuk Broadcaster (OBS Studio)**

1. **Buka OBS Studio**
2. **Settings → Stream**
3. **Service**: Custom...
4. **Server**: `rtmp://live.deluwang.online/live`
5. **Stream Key**: `[STREAM_KEY_ANDA]` (misal: `deluwang-live`)
6. **Output Settings**:
   - Video Bitrate: 2500-4000 Kbps
   - Audio Bitrate: 128 Kbps
   - Keyframe Interval: 2 seconds
   - Profile: High

### **B. Untuk Penonton (Web Application)**

1. **Integrasikan component** ke `apps/web/livestreaming`:
```html
<!-- Copy content dari /var/www/vod/livestreaming-component.html -->
```

2. ** atau buat embed**:
```html
<video id="player" controls autoplay>
  <source src="http://live.deluwang.online/hls/deluwang-live.m3u8" type="application/x-mpegURL">
</video>

<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const video = document.getElementById('player');
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource('http://live.deluwang.online/hls/deluwang-live.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  }
</script>
```

### **C. Live Chat Integration**

```html
<!-- Socket.IO Client -->
<script src="http://live.deluwang.online:3007/socket.io/socket.io.js"></script>

<script>
const socket = io('http://live.deluwang.online:3007');

// Send message
socket.emit('sendMessage', {
  username: 'User123',
  message: 'Halo semua!'
});

// Receive messages
socket.on('newMessage', (message) => {
  console.log(message);
});
</script>
```

---

## 🛠️ **MANAGEMENT COMMANDS:**

### **Start/Stop Services:**
```bash
cd /var/www/vod

# Start all live streaming services
docker-compose up -d nginx-rtmp live-chat

# Stop services
docker-compose stop nginx-rtmp live-chat

# View logs
docker-compose logs -f nginx-rtmp
docker-compose logs -f live-chat

# Check status
docker ps
```

### **Nginx Management:**
```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Check status
systemctl status nginx
```

### **Monitor Services:**
```bash
# Check RTMP statistics
curl http://localhost:8080/stat

# Check chat server health
curl http://localhost:3007/health

# Check firewall ports
ufw status numbered
```

---

## 🔧 **CUSTOMIZATION:**

### **Change Stream Keys:**
Edit `/var/www/vod/rtmp/nginx-rtmp.conf`:
```nginx
application live {
    live on;
    # Your custom configuration
}
```

### **Custom Chat Server:**
Edit `/var/www/vod/rtmp/chat/server.js` untuk:
- Rate limiting
- Authentication
- Message filtering
- Custom events

### **Branding:**
- Modify HTML/CSS di component files
- Custom thumbnail images
- Custom chat styling

---

## 🔒 **SECURITY NOTES:**

### **Current Configuration:**
- ✅ Open ports: 1935 (RTMP), 8080 (HLS), 3007 (Chat)
- ✅ CORS enabled for `deluwang.online`
- ✅ Basic rate limiting di chat
- ⚠️ **RECOMMENDED**: Stream key authentication

### **Security Improvements:**
1. **Stream Key Authentication**:
```nginx
# Add to nginx-rtmp.conf
on_publish http://localhost:3005/api/live/auth;
```

2. **Domain Restriction**:
```nginx
# Update live-deluwang.conf
valid_referers deluwang.online live.deluwang.online;
```

3. **HTTPS/SSL Setup**:
```bash
# Install SSL untuk live.deluwang.online
certbot --nginx -d live.deluwang.online
```

---

## 📊 **MONITORING & ANALYTICS:**

### **Available Endpoints:**
- **RTMP Stats**: `http://live.deluwang.online/stat`
- **Chat Health**: `http://live.deluwang.online:3007/health`
- **Stream Status**: `http://live.deluwang.online:3007/stream-status`

### **Key Metrics:**
- Viewer count
- Message count
- Bandwidth usage
- Connection status

---

## 🐛 **TROUBLESHOOTING:**

### **Stream Not Loading:**
1. Check OBS connection: `rtmp://live.deluwang.online/live/[STREAM_KEY]`
2. Verify Docker services: `docker ps`
3. Check ports: `netstat -tulnp | grep -E ':(1935|8080|3007)'`

### **Chat Not Working:**
1. Check chat server: `curl http://localhost:3007/health`
2. Verify Socket.IO connection
3. Check browser console for errors

### **HLS Issues:**
1. Check manifest: `curl http://localhost:8080/hls/[STREAM_KEY].m3u8`
2. Verify file permissions: `ls -la /var/www/vod/rtmp/hls/`
3. Check Nginx configuration: `nginx -t`

---

## 🎯 **NEXT STEPS:**

1. **✅ DONE**: Setup Docker live streaming
2. **🔄 IN PROGRESS**: Integrate ke `apps/web/livestreaming`
3. **⏳ TODO**:
   - Add stream key authentication
   - Implement recording functionality
   - Add analytics dashboard
   - Setup SSL certificate
   - Add stream scheduling

---

## 📞 **SUPPORT:**

- **Docker Services**: `docker-compose logs [service-name]`
- **Nginx Issues**: `/var/log/nginx/live.deluwang.online.error.log`
- **Chat Server**: Container logs
- **RTMP Issues**: Check OBS settings and network connectivity

---

**🎉 SELAMAT! Live streaming Deluwang siap digunakan!**

Untuk mulai streaming:
1. Buka OBS dengan settings di atas
2. Access menu `livestreaming` di `deluwang.online`
3. Mulai broadcast dan interaksi dengan penonton!