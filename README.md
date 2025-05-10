# GeoServer Status Monitor

**GeoServer Status Monitor** is a full-stack application designed to monitor and visualize real-time system metrics from a GeoServer instance. It features a FastAPI backend that interfaces with GeoServer's status endpoint and a React frontend built with Vite.

---

## 🚀 Features

* **Real-Time Monitoring**: Displays up-to-date system metrics including CPU load, memory usage, swap space, disk utilization, network I/O, and GeoServer-specific statistics.
* **FastAPI Backend**: Efficiently fetches and serves system status data from GeoServer.
* **React Frontend**: Built with Vite for rapid development and optimized production builds.
* **Responsive Design**: Ensures compatibility across various devices and screen sizes.

---

## ⚙️ Backend Setup (FastAPI)

1. **Navigate to the backend directory**:

   ```bash
   cd api
   ```

2. **Install dependencies**:

   ```bash
   uv add
   ```

3. **Run the FastAPI server**:

   ```bash
   uvicorn main:app --reload
   ```

   The backend will be accessible at `http://localhost:8000`.
   make sure u put ur username and password of ur geo server in that main.py and then run it.

---

## 🌐 Frontend Setup (React with Vite)

1. **Navigate to the frontend directory**:

   ```bash
   cd ui/geo-monitor
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

   The frontend will be accessible at `http://localhost:5173`.

---

## 🛠️ Build for Production

1. **Build the frontend**:

   ```bash
   npm run build
   ```

   This will generate a `dist` directory with the production-ready assets.

2. **Serve the frontend**:

   You can use a static file server like `serve`:

   ```bash
   npm install -g serve
   serve -s dist
   ```

   Alternatively, configure your backend to serve the static files.
