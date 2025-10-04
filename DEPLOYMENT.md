# Deployment Guide - Health Platform Backend

Complete guide for deploying the health platform backend to production.

---

## 📋 Command Reference

### 🔧 One-Time Setup Commands
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 🚀 Daily Development Commands
```bash
# Start development server
npm run start:dev
```

### 🏭 Production Commands
```bash
# Build application
npm run build

# Start production server
npm run start:prod
```

### 🧪 Testing Commands
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Prerequisites

### Required Services
1. **PostgreSQL Database** - Supabase or any PostgreSQL 12+
2. **Redis Instance** - For Bull queue (background jobs)
3. **AWS S3 Bucket** - For lab result file storage
4. **Node.js** - Version 18+ LTS

### Required Credentials
- Database connection string
- Redis connection details
- AWS credentials (Access Key ID, Secret Access Key)
- S3 bucket name and region
- JWT secret keys

---

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Authentication
JWT_SECRET="your-very-secure-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-very-secure-refresh-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_BUCKET_NAME="your-s3-bucket-name"

# Server
PORT=3000
NODE_ENV="production"
```

### Security Notes
- Use strong, random secrets for JWT keys (32+ characters)
- Never commit `.env` file to version control
- Use different secrets for each environment
- Rotate secrets regularly in production

---

## Database Setup

### 1. Create Database
If using Supabase:
- Create a new project at https://supabase.com
- Note the connection string from Settings > Database

If using standalone PostgreSQL:
```bash
createdb health_platform
```

### 2. Run Migrations
```bash
npx prisma db push
```

### 3. Seed Initial Data
```bash
npx prisma db seed
```

This creates 3 default systems:
- Doula (prenatal care)
- Functional Health (wellness)
- Elderly Care (senior health)

---

## AWS S3 Setup

### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

### 2. Configure Bucket Policy
Allow your application to read/write objects:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:user/YOUR_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 3. Configure CORS
Enable uploads from your frontend:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

---

## Redis Setup

### Local Development
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Production Options

**Option 1: Redis Cloud**
- Sign up at https://redis.com/cloud
- Create a free instance
- Use connection details in `.env`

**Option 2: AWS ElastiCache**
- Create Redis cluster in AWS
- Configure security groups
- Use endpoint in `.env`

**Option 3: Docker Container**
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:alpine
```

---

## Application Deployment

### Option 1: Docker (Recommended)

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

#### 3. Deploy
```bash
docker-compose up -d
```

### Option 2: PM2

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Create ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'health-platform',
    script: 'dist/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

#### 3. Deploy
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 3: Heroku

#### 1. Create Procfile
```
web: npm run start:prod
release: npx prisma migrate deploy
```

#### 2. Deploy
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
heroku config:set JWT_SECRET=your-secret
# ... set all other env vars
git push heroku main
```

### Option 4: AWS ECS/Fargate

#### 1. Push to ECR
```bash
aws ecr create-repository --repository-name health-platform
docker build -t health-platform .
docker tag health-platform:latest AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/health-platform:latest
docker push AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/health-platform:latest
```

#### 2. Create Task Definition
```json
{
  "family": "health-platform",
  "containerDefinitions": [{
    "name": "app",
    "image": "AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/health-platform:latest",
    "memory": 512,
    "cpu": 256,
    "essential": true,
    "portMappings": [{
      "containerPort": 3000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"}
    ]
  }]
}
```

#### 3. Create Service
Use AWS Console or CLI to create ECS service with load balancer.

---

## SSL/TLS Configuration

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Let's Encrypt
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## Health Checks

### Liveness Probe
```bash
curl http://localhost:3000
# Should return "Hello World!"
```

### Readiness Probe
Check database connectivity:
```bash
curl http://localhost:3000/health
# Implement health endpoint if needed
```

---

## Monitoring

### Logging

#### Winston Logger (Recommended)
```bash
npm install winston
```

Configure in `src/main.ts`:
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
logger.log(`Application listening on port ${port}`);
```

#### Log Files
```bash
mkdir logs
# Configure log rotation
```

### Application Performance

#### New Relic
```bash
npm install newrelic
```

#### Datadog
```bash
npm install dd-trace
```

### Error Tracking

#### Sentry
```bash
npm install @sentry/node
```

Configure in `src/main.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## Backup Strategy

### Database Backups

#### Automated Supabase Backups
- Daily backups enabled by default
- Point-in-time recovery available

#### Manual PostgreSQL Backups
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

#### Restore
```bash
psql $DATABASE_URL < backup_20251003.sql
```

### S3 Backups

#### Enable Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket your-bucket-name \
  --versioning-configuration Status=Enabled
```

#### Cross-Region Replication
Configure in AWS Console for disaster recovery.

---

## Security Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Strong JWT secrets generated
- [ ] Database passwords are complex
- [ ] AWS credentials have minimal permissions
- [ ] Redis password set (if exposed)
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS protection enabled
- [ ] Helmet middleware configured

### Post-Deployment
- [ ] SSL/TLS certificates installed
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database backups verified
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Error tracking operational
- [ ] Health checks passing

---

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lab_results_user ON lab_results(user_id, system_id);
CREATE INDEX idx_biomarkers_test ON biomarkers(test_name);
```

### Caching Strategy
```typescript
// Implement Redis caching for frequently accessed data
import { CACHE_MANAGER } from '@nestjs/cache-manager';
```

### Connection Pooling
```typescript
// Prisma connection pooling (configure in schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 20
}
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Enable multiple application instances
- Use cluster mode with PM2
- Session state must be stateless (JWT tokens)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Add database read replicas

### Background Jobs
- Bull queue handles OCR processing
- Scale Redis for high throughput
- Monitor queue depth and processing times

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs health-platform
# or
docker logs container-name

# Verify environment variables
env | grep DATABASE_URL

# Test database connection
npx prisma db pull
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check if database exists
psql $DATABASE_URL -c "\l"

# Verify migrations
npx prisma migrate status
```

### S3 Upload Failures
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Check bucket permissions
aws s3api get-bucket-policy --bucket your-bucket-name
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check Redis info
redis-cli info
```

### OCR Processing Stuck
```bash
# Check Bull queue dashboard
# Monitor Redis queue depth
redis-cli llen bull:ocr-processing:active

# Clear stuck jobs
redis-cli del bull:ocr-processing:active
```

---

## Rollback Procedure

### Application Rollback
```bash
# Docker
docker-compose down
docker-compose up -d --build

# PM2
pm2 stop health-platform
git checkout previous-commit
npm run build
pm2 restart health-platform

# Heroku
heroku rollback
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_previous.sql

# Or use Prisma migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

---

## Production Checklist

### Before Launch
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on operations

### Launch Day
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor logs and metrics
- [ ] Confirm backups working

### Post-Launch
- [ ] Monitor for 24-48 hours
- [ ] Review logs for errors
- [ ] Check performance metrics
- [ ] Verify user workflows
- [ ] Document any issues

---

## Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Security patches immediately
- Database optimization quarterly
- Review logs weekly
- Test backups monthly

### Monitoring Alerts
Configure alerts for:
- Application downtime
- High error rates
- Database connection failures
- S3 upload failures
- Queue processing delays
- High memory/CPU usage

---

**Need Help?**
- Check logs first
- Review Swagger docs at `/api`
- Consult phase summaries in repo
- Contact development team
