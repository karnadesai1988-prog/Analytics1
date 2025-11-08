# R Territory - Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd r-territory
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- MongoDB: localhost:27017

5. **View logs**
```bash
docker-compose logs -f
```

6. **Stop services**
```bash
docker-compose down
```

## Manual Deployment

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env with your settings

# Run server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend
yarn install

# Configure .env
cp .env.example .env
# Edit REACT_APP_BACKEND_URL

# Run dev server
yarn start

# Or build for production
yarn build
```

### MongoDB Setup

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb
# or
mongod --dbpath /path/to/data
```

## Production Deployment

### Environment Variables

**Backend (.env)**
```
MONGO_URL=mongodb://your-mongo-host:27017
DB_NAME=r_territory_db
CORS_ORIGINS=https://yourdomain.com
JWT_SECRET=generate-strong-secret-key
OPENAI_API_KEY=sk-optional-global-key
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Security Checklist

- [ ] Change JWT_SECRET to a strong random key
- [ ] Configure CORS_ORIGINS to your domain
- [ ] Use HTTPS in production
- [ ] Set up MongoDB authentication
- [ ] Use environment-specific API keys
- [ ] Enable rate limiting
- [ ] Set up backup for MongoDB

### Scaling

**Horizontal Scaling:**
- Run multiple backend instances behind a load balancer
- Use MongoDB replica set
- Configure WebSocket sticky sessions

**Vertical Scaling:**
- Increase container resources in docker-compose.yml
- Optimize MongoDB indexes
- Enable caching (Redis)

## Cloud Deployment

### AWS

1. **EC2 Deployment**
```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Clone and deploy
git clone <repo>
cd r-territory
docker-compose up -d
```

2. **AWS ECS/Fargate**
- Use docker-compose.yml as base
- Create task definitions
- Set up ALB for load balancing

### Digital Ocean

1. **App Platform**
- Connect GitHub repo
- Configure build settings
- Set environment variables
- Deploy automatically

### Heroku

```bash
# Backend
heroku create r-territory-api
heroku addons:create mongolab
heroku config:set JWT_SECRET=your-secret
git push heroku main

# Frontend
heroku create r-territory-app
heroku config:set REACT_APP_BACKEND_URL=https://r-territory-api.herokuapp.com
git push heroku main
```

## Monitoring

### Health Checks
- Backend: http://localhost:8001/api/health
- Frontend: http://localhost:3000

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Application logs
tail -f /var/log/r-territory/*.log
```

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify .env file exists
- Check port 8001 availability

### Frontend can't connect
- Verify REACT_APP_BACKEND_URL
- Check CORS configuration
- Ensure backend is running

### WebSocket issues
- Configure reverse proxy for WebSocket
- Check firewall rules
- Enable sticky sessions

## Backup

### MongoDB Backup
```bash
# Backup
mongodump --db r_territory_db --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db r_territory_db /backup/20250108
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-mongo.sh
```

## Updates

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d
```