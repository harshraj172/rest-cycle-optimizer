<!-- # Rest Cycle 🌙

A mobile-first sleep tracking app built with Streamlit for college students to break unhealthy sleep cycles and find their optimal rhythm.

## Features

- 📝 **Sleep Logging**: Track sleep hours, quality, and energy levels
- 📊 **Analytics**: Visualize sleep patterns and trends
- 💬 **AI Sleep Coach**: Get personalized advice using OpenAI
- 📱 **Mobile-First Design**: Optimized for mobile devices

## Project Structure

```
rest_optimizer/
├── app.py              # Main Streamlit application
├── styles.css          # CSS styles for the app
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the app:
```bash
streamlit run app.py
```

3. Open your browser and navigate to the provided URL (usually `http://localhost:8501`)

4. Enter your OpenAI API key in the app to enable the AI chat feature

## Usage

- **Home**: View quick stats and navigate to other sections
- **Log**: Record your sleep data with detailed metrics
- **Analytics**: View charts and insights about your sleep patterns
- **Chat**: Ask the AI sleep coach for personalized advice

## Technologies Used

- **Streamlit**: Web app framework
- **Plotly**: Interactive charts and visualizations
- **OpenAI**: AI-powered sleep coaching
- **Pandas**: Data manipulation and analysis

---

## Option 1: Simple Python Setup (Recommended for beginners)

### 1. Download all files
Make sure you have these files in the same folder:
- `app.py`
- `requirements.txt`

### 2. Install dependencies
Open your terminal/command prompt and run:

```bash
pip install -r requirements.txt
```

### 3. Run the app
```bash
streamlit run app.py
```

### 4. Open in browser
The app will automatically open in your browser at `http://localhost:8501`

**For mobile testing:** Open the same URL on your phone (make sure your phone is on the same WiFi network)

---

## 📱 Mobile Testing
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `hostname -I`

2. On your phone's browser, go to:
   ```
   http://[YOUR-IP-ADDRESS]:8501
   ```
   Example: `http://192.168.1.100:8501`

3. Make sure both devices are on the same WiFi network

---

## 🔑 API Key Setup

1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Enter it in the app's home screen
3. The key is only stored for your current session

--- -->



# 🌙 Rest Cycle Optimizer

A sophisticated sleep tracking application designed specifically for college students with irregular schedules.

## Features

✅ Advanced sleep debt calculations  
✅ AI-powered personalized insights  
✅ Chronotype detection  
✅ Pattern recognition for exam weeks  
✅ Beautiful mobile-first UI with dark mode  
✅ RESTful API with Node.js/Express  

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 6.0+
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/rest-cycle-optimizer.git
cd rest-cycle-optimizer
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your OpenAI API key
```

3. Setup Frontend
```bash
cd ../frontend
npm install
```

4. Start MongoDB
```bash
mongod
```

5. Run the Application
```bash
# Terminal 1: Backend
cd backend
npm run seed
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

6. Open `http://localhost:3000`

### Docker Deployment
```bash
docker-compose up
```

### API Endpoints

- POST /api/sleep-logs - Create sleep log
- GET /api/sleep-logs/:userId - Get user's logs
- GET /api/analysis/:userId - Get sleep analysis
- POST /api/ai-insights/:userId - Get AI insights