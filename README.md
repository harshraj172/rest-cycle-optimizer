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
npm run seed:demo
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