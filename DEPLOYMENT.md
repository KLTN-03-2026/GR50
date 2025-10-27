# 🚀 DEPLOYMENT & PRODUCTION GUIDE

## 📋 Pre-Deployment Checklist

### Security

- [ ] Change `JWT_SECRET_KEY` in `.env` to a strong secret
- [ ] Update MySQL password to a strong password
- [ ] Remove or disable test/sample accounts
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins (remove "*")
- [ ] Set `ENVIRONMENT=production` in `.env`

### Performance

- [ ] Enable MySQL query caching
- [ ] Add database indexes for frequently queried fields
- [ ] Configure connection pooling
- [ ] Enable gzip compression
- [ ] Optimize frontend build (`yarn build`)

### Monitoring

- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Configure application monitoring
- [ ] Setup database backup schedule
- [ ] Configure health check endpoints

---

## 🔐 Production Environment Variables

### Backend `.env`

```env
# MySQL Configuration
MYSQL_HOST=your-mysql-host
MYSQL_PORT=3306
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-strong-password-here
MYSQL_DATABASE=medischedule

# Database URL
DATABASE_URL=mysql+aiomysql://user:password@host:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-minimum-32-characters-long
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours for production

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Environment
ENVIRONMENT=production

# AI Features (Optional)
EMERGENT_LLM_KEY=your-production-api-key
```

### Frontend `.env.production`

```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

---

## 🖥️ Deployment Options

### Option 1: VPS (Ubuntu/Debian)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.10 python3-pip python3-venv -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y
```

#### 2. Setup Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/medischedule
cd /var/www/medischedule

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create production .env
cp .env.example .env
# Edit .env with production values

# Frontend setup
cd ../frontend
npm install -g yarn
yarn install
yarn build
```

#### 3. Setup MySQL Database

```bash
# Create database
mysql -u root -p
CREATE DATABASE medischedule;
CREATE USER 'medischedule_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON medischedule.* TO 'medischedule_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u medischedule_user -p medischedule < backend/create_database.sql

# Create admin
cd backend
source venv/bin/activate
python create_admin_mysql.py
```

#### 4. Setup Systemd Service (Backend)

Create `/etc/systemd/system/medischedule-backend.service`:

```ini
[Unit]
Description=MediSchedule Backend
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/medischedule/backend
Environment="PATH=/var/www/medischedule/backend/venv/bin"
ExecStart=/var/www/medischedule/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable medischedule-backend
sudo systemctl start medischedule-backend
sudo systemctl status medischedule-backend
```

#### 5. Setup Nginx

Create `/etc/nginx/sites-available/medischedule`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8001;
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

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/medischedule/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/medischedule /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

### Option 2: Docker Deployment

#### 1. Create `Dockerfile.backend`

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Expose port
EXPOSE 8001

# Run application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### 2. Create `Dockerfile.frontend`

```dockerfile
FROM node:18 as build

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install

# Copy source and build
COPY frontend/ .
RUN yarn build

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: medischedule
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/create_database.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - DATABASE_URL=mysql+aiomysql://root:${MYSQL_PASSWORD}@mysql:3306/medischedule
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ENVIRONMENT=production
    ports:
      - "8001:8001"
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 4. Deploy with Docker

```bash
# Create .env file
cp .env.example .env
# Edit with production values

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Create admin (first time only)
docker-compose exec backend python create_admin_mysql.py
```

---

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create medischedule-api
heroku create medischedule-web

# Add MySQL addon
heroku addons:create cleardb:ignite -a medischedule-api

# Deploy backend
cd backend
git init
git add .
git commit -m "Deploy"
heroku git:remote -a medischedule-api
git push heroku main

# Deploy frontend
cd ../frontend
# Update REACT_APP_BACKEND_URL to Heroku backend URL
yarn build
# Deploy build folder
```

#### AWS (EC2 + RDS)

1. **Create RDS MySQL instance**
2. **Launch EC2 instance** (Ubuntu)
3. **Follow VPS deployment steps** above
4. **Configure Security Groups**:
   - Allow port 80, 443 (web)
   - Allow port 3306 from EC2 to RDS

#### Digital Ocean

1. **Create Droplet** (Ubuntu)
2. **Create Managed MySQL Database**
3. **Follow VPS deployment steps**
4. **Setup firewall** with `ufw`

---

## 📊 Database Backup

### Manual Backup

```bash
# Full backup
mysqldump -u root -p medischedule > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
mysqldump -u root -p medischedule | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Automated Daily Backup

Create `/etc/cron.daily/medischedule-backup`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/medischedule"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u root -p'password' medischedule | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /etc/cron.daily/medischedule-backup
```

### Restore Backup

```bash
# From .sql file
mysql -u root -p medischedule < backup.sql

# From .sql.gz file
gunzip < backup.sql.gz | mysql -u root -p medischedule
```

---

## 🔍 Monitoring & Logging

### Application Logs

```bash
# Backend logs (systemd)
sudo journalctl -u medischedule-backend -f

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Health Checks

Setup external monitoring (e.g., UptimeRobot, Pingdom):
- Monitor: `https://api.yourdomain.com/health`
- Check every 5 minutes
- Alert on downtime

### Error Tracking

Integrate Sentry in backend:

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production"
)
```

---

## 🛡️ Security Best Practices

### 1. Firewall Configuration

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Rate Limiting (Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        # ... proxy settings
    }
}
```

### 3. Database Security

```sql
-- Use strong passwords
-- Create separate user for application
-- Revoke unnecessary privileges
-- Enable MySQL SSL connections
```

### 4. Environment Variables

- Never commit `.env` files to git
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate passwords regularly

---

## 📈 Performance Optimization

### MySQL Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_doctor_specialty ON doctors(specialty_id);

-- Configure MySQL for better performance
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
query_cache_size = 64M
```

### Backend Optimization

```python
# Use connection pooling
# Enable response caching for static endpoints
# Optimize database queries with eager loading
```

### Frontend Optimization

```bash
# Enable code splitting
# Lazy load routes
# Optimize images
# Enable gzip compression in Nginx
```

---

## 🔄 Update & Maintenance

### Update Application

```bash
# Pull latest code
cd /var/www/medischedule
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart medischedule-backend

# Update frontend
cd ../frontend
yarn install
yarn build
```

### Database Migrations

```bash
# Backup first!
mysqldump -u root -p medischedule > backup_before_migration.sql

# Run migration SQL
mysql -u root -p medischedule < migration_script.sql

# Verify
mysql -u root -p medischedule
SHOW TABLES;
DESCRIBE table_name;
```

---

## 📞 Support & Troubleshooting

### Common Production Issues

1. **502 Bad Gateway**: Backend not running
   ```bash
   sudo systemctl status medischedule-backend
   sudo systemctl restart medischedule-backend
   ```

2. **Database connection refused**: MySQL not running
   ```bash
   sudo systemctl status mysql
   sudo systemctl restart mysql
   ```

3. **High CPU usage**: Check slow queries
   ```sql
   SHOW FULL PROCESSLIST;
   ```

---

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] SSL certificates installed
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] Health checks passing
- [ ] Test all user flows
- [ ] Performance testing done
- [ ] Security audit completed
- [ ] Documentation updated

---

**🎉 Your MediSchedule application is now production-ready!**

For questions or issues, refer to:
- [README.md](README.md) - Main documentation
- [README_WINDOWS.md](README_WINDOWS.md) - Windows guide
- [QUICK_START.md](QUICK_START.md) - Quick start guide
