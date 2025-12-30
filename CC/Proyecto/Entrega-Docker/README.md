# 📝 To-Do List (Node.js + Express) — Docker Image

Docker image for my personal **To-Do List web app**, built with Node.js and Express.

You can deploy it on any machine — including **Raspberry Pi** — and access it easily through a browser.  
Ideal for managing household tasks and keeping everything organized at home.

---

## 📥 Pull the image

```bash
docker pull pablo0304/mytodolist:v1
```

---

## 🚀 Quick Start (default port 80)

The app listens **inside the container** on `PORT` (default: **80**).  
 You can expose it on any host port using `-p`.

### Option A — Default internal port (80)

```bash
docker run -d --name mytodolist --restart unless-stopped \
  -p 80:80 \
  -v "$(pwd)/data:/app/data" \
  pablo0304/mytodolist:v1
```

Then open 👉 [http://localhost](http://localhost)

---

### Option B — Custom internal port

If you set a custom port with `-e PORT`, make sure it matches the container mapping:

```bash
docker run -d --name mytodolist --restart unless-stopped \
  -p 80:8080 \
  -e PORT=8080 \
  -e COOKIE_SECRET="supersecret" \
  -e DATA_DIR="/app/data" \
  -v "$(pwd)/data:/app/data" \
  pablo0304/mytodolist:v1
```

Then open 👉 [http://localhost](http://localhost)

---

## ⚙️ Environment Variables & Flags

| Variable / Flag      | Description                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-p HOST:CONTAINER`  | Maps **host** port to **container** port. Use `-p 8080:80` to expose on 8080.                                                                                 |
| `-e PORT`            | Port used **inside** the container. Defaults to 80.                                                                                                           |
| `-e COOKIE_SECRET`   | A long, unique secret string for signing session cookies (prevents tampering). Generate one with `openssl rand -base64 32`.                                   |
| `-e DATA_DIR`        | Internal directory where the app stores `users.json` and `tasks.json`. Defaults to `/app/data`. Change it only if you also update the volume mapping (`-v`).  |
| `-v /path:/app/data` | Mounts a **host directory** to the container's data directory (set by `DATA_DIR`). This ensures user and task data persists even if the container is removed. |

| `--name mytodolist` | Logical container name for easy reference. |
| `--restart unless-stopped` | Automatically restarts on reboot unless manually stopped. |

---

## 📂 Data Persistence

On first run, the container will create `users.json` and `tasks.json` inside `/app/data`.  
 You can map this folder to a local directory for persistence:

```bash
-v "$(pwd)/data:/app/data"
```

---

## 🛠 Logs & Maintenance

```bash
# View logs
docker logs -f mytodolist

# Stop container
docker stop mytodolist

# Remove container
docker rm mytodolist
```

---

## 📝 Notes

- If no `PORT` is set, the app listens on **80** inside the container.
- `COOKIE_SECRET` is required for session cookie signing — use a secure, random value.
- Compatible with **Raspberry Pi** (Node 18 Alpine base image).
- Minimal setup required — just run the container and open the browser.

---

## 🌐 Using a custom local domain (Optional)

By default, you can access the app via your Raspberry Pi’s IP address, e.g.:

```
http://192.168.1.50
```

To make it easier to remember, you can use a **custom local domain** like:

```
http://mytodolist.local
```

There are two simple ways to set this up:

### 📝 Option 1 — Edit the hosts file (per device)

Add a line in your local machine’s hosts file:

```
192.168.1.50 mytodolist.local
```

- **Linux / macOS** → `/etc/hosts`
- **Windows** → `C:\Windows\System32\drivers\etc\hosts`

After saving, open [http://mytodolist.local](http://mytodolist.local) in your browser 🚀

---

### 🌐 Option 2 — Use your router’s local DNS (recommended)

If your router supports local DNS overrides, you can configure:

```
mytodolist.local → 192.168.1.50
```

This way, all devices in your home network can access the app using the same address without editing each one manually.

Check your router’s DNS or LAN settings — many home routers support this feature.

---

© pablo0304 — MIT License
