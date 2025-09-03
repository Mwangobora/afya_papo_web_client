# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AfyaPapo emergency response system in production environments. The system is containerized using Docker and designed for scalability and high availability.

## Prerequisites

### System Requirements

**Server Specifications (Minimum)**
- **CPU**: 4 cores (8 cores recommended for high traffic)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 100GB SSD (with expansion capability)
- **Network**: 100 Mbps connection with low latency
- **OS**: Ubuntu 20.04 LTS or higher, CentOS 8+, or RHEL 8+

**External Services**
- Domain name with SSL certificate
- Twilio account for SMS/voice services
- FCM/APNs keys for push notifications
- CDN service (optional but recommended)

### Required Software

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Nginx (reverse proxy)
sudo apt update
sudo apt install nginx

# Certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx

# Git for code deployment
sudo apt install git
```

## Environment Configuration

### Environment Variables

Create production environment file:

```bash
# /home/deploy/afya_papo/.env
# Django Configuration
DEBUG=False
SECRET_KEY=your-secret-key-here-min-50-chars
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DJANGO_SETTINGS_MODULE=afyaPapo_core.settings

# Database Configuration
DB_NAME=afyapapo_prod
DB_USER=afyapapo_user
DB_PASSWORD=secure-database-password
DB_HOST=db
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379/0
CACHE_URL=redis://redis:6379/1

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# Email Configuration (for admin notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=notifications@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
APNS_CERTIFICATE_PATH=/app/certs/apns_cert.pem
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_REFERRER_POLICY=strict-origin-when-cross-origin

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    env_file:
      - .env
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
      - ./logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend
      - frontend
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites-available:/etc/nginx/sites-available
      - ./ssl:/etc/ssl/certs
    depends_on:
      - web
    networks:
      - frontend
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  celery_worker:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: celery -A afyaPapo_core worker --loglevel=info --concurrency=4
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - backend
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  celery_beat:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: celery -A afyaPapo_core beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file:
      - .env
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    networks:
      - backend
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
FROM python:3.11-slim

# Install system dependencies including GDAL
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        gdal-bin \
        libgdal-dev \
        libpq-dev \
        gcc \
        g++ \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so

# Create app directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/static /app/media /app/logs

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# Run application
EXPOSE 8000
CMD ["uvicorn", "afyaPapo_core.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Nginx Configuration

### Main Nginx Configuration

Create `/etc/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    include /etc/nginx/sites-available/*;
}
```

### Site Configuration

Create `/etc/nginx/sites-available/afyapapo.conf`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=graphql:10m rate=5r/s;

# Upstream backend
upstream django_backend {
    least_conn;
    server web:8000 max_fails=3 fail_timeout=30s;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/certs/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss:";

    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/media/;
        expires 1d;
        add_header Cache-Control "public";
    }

    # GraphQL endpoint with rate limiting
    location /graphql/ {
        limit_req zone=graphql burst=20 nodelay;
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket connections
    location /ws/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health/ {
        proxy_pass http://django_backend;
        access_log off;
    }

    # Main application
    location / {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deployment Process

### Initial Deployment

1. **Server Setup**

```bash
# Create deployment directory
sudo mkdir -p /home/deploy/afya_papo
cd /home/deploy/afya_papo

# Clone repository
git clone https://github.com/your-username/afya_papo.git .

# Set proper permissions
sudo chown -R deploy:deploy /home/deploy/afya_papo
chmod 755 /home/deploy/afya_papo
```

2. **SSL Certificate Setup**

```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or manually place certificates
sudo mkdir -p /etc/ssl/certs
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/certs/
sudo chmod 600 /etc/ssl/certs/yourdomain.com.key
```

3. **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit production environment
nano .env

# Generate Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

4. **Database Initialization**

```bash
# Start database service
docker-compose -f docker-compose.prod.yml up -d db redis

# Wait for database to be ready
docker-compose -f docker-compose.prod.yml exec db pg_isready -U afyapapo_user -d afyapapo_prod

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml run --rm web python manage.py createsuperuser

# Load initial data
docker-compose -f docker-compose.prod.yml run --rm web python manage.py loaddata fixtures/tanzania_regions.json
docker-compose -f docker-compose.prod.yml run --rm web python manage.py loaddata fixtures/hospital_categories.json
```

5. **Full Deployment**

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Continuous Deployment

Create deployment script `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U afyapapo_user afyapapo_prod > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Build and deploy with zero downtime
docker-compose -f docker-compose.prod.yml build web
docker-compose -f docker-compose.prod.yml up -d --no-deps web

# Run migrations
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput

# Restart services
docker-compose -f docker-compose.prod.yml restart celery_worker celery_beat

# Health check
sleep 30
curl -f http://localhost/health/ || exit 1

echo "Deployment completed successfully!"
```

## Monitoring and Maintenance

### Health Monitoring

Create health check endpoint in Django:

```python
# Add to urls.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis

def health_check(request):
    try:
        # Database check
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Redis check
        cache.set('health_check', 'ok', 30)
        cache.get('health_check')
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'ok',
            'cache': 'ok',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=503)
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily backup script

BACKUP_DIR="/home/deploy/afya_papo/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U afyapapo_user afyapapo_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Media files backup
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /home/deploy/afya_papo media/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/database/
# aws s3 cp $BACKUP_DIR/media_$DATE.tar.gz s3://your-backup-bucket/media/
```

### Log Rotation

Create `/etc/logrotate.d/afyapapo`:

```
/home/deploy/afya_papo/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    copytruncate
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /home/deploy/afya_papo/docker-compose.prod.yml restart web celery_worker celery_beat
    endscript
}
```

### System Monitoring

Create monitoring script `monitor.sh`:

```bash
#!/bin/bash
# System monitoring and alerting

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "Warning: Disk usage is at $DISK_USAGE%" | mail -s "Disk Space Alert" admin@yourdomain.com
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
    echo "Warning: Memory usage is at $MEM_USAGE%" | mail -s "Memory Alert" admin@yourdomain.com
fi

# Check service health
if ! curl -f http://localhost/health/ > /dev/null 2>&1; then
    echo "Error: Health check failed" | mail -s "Service Health Alert" admin@yourdomain.com
fi

# Check SSL certificate expiry
SSL_EXPIRY=$(echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates | grep 'notAfter' | cut -d= -f2)
DAYS_TO_EXPIRY=$(( ($(date -d "$SSL_EXPIRY" +%s) - $(date +%s)) / 86400 ))
if [ $DAYS_TO_EXPIRY -lt 30 ]; then
    echo "Warning: SSL certificate expires in $DAYS_TO_EXPIRY days" | mail -s "SSL Certificate Alert" admin@yourdomain.com
fi
```

### Performance Optimization

1. **Database Optimization**

```sql
-- Add these to PostgreSQL configuration
-- postgresql.conf optimizations
shared_buffers = '2GB'
effective_cache_size = '6GB'
maintenance_work_mem = '512MB'
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = '16MB'
min_wal_size = '1GB'
max_wal_size = '4GB'
```

2. **Redis Optimization**

```redis
# redis.conf optimizations
maxmemory 512mb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
save 900 1
save 300 10
save 60 10000
```

### Scaling Considerations

1. **Horizontal Scaling**

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  web:
    deploy:
      replicas: 5
      update_config:
        parallelism: 1
        delay: 30s
        failure_action: rollback
      restart_policy:
        condition: on-failure

  celery_worker:
    deploy:
      replicas: 4
```

2. **Load Balancer Configuration**

```nginx
upstream django_backend {
    least_conn;
    server web_1:8000 max_fails=3 fail_timeout=30s;
    server web_2:8000 max_fails=3 fail_timeout=30s;
    server web_3:8000 max_fails=3 fail_timeout=30s;
    server web_4:8000 max_fails=3 fail_timeout=30s;
    server web_5:8000 max_fails=3 fail_timeout=30s;
}
```

## Security Hardening

### System Security

```bash
# Firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Application Security

1. **HTTPS Enforcement**: All traffic redirected to HTTPS
2. **HSTS Headers**: Prevent protocol downgrade attacks
3. **CSP Headers**: Prevent XSS attacks
4. **Rate Limiting**: Prevent API abuse
5. **JWT Security**: Short-lived tokens with refresh mechanism
6. **Database Security**: Connection encryption and restricted access
7. **Input Validation**: All user inputs validated and sanitized
8. **File Upload Security**: Type and size restrictions

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check database connectivity
docker-compose -f docker-compose.prod.yml exec web python manage.py dbshell

# Reset database connections
docker-compose -f docker-compose.prod.yml restart db
```

2. **Redis Connection Issues**
```bash
# Check Redis connectivity
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Clear Redis cache
docker-compose -f docker-compose.prod.yml exec redis redis-cli flushall
```

3. **SSL Certificate Issues**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew --nginx

# Test SSL configuration
openssl s_client -servername yourdomain.com -connect yourdomain.com:443
```

4. **Performance Issues**
```bash
# Check resource usage
docker stats

# Analyze slow queries
docker-compose -f docker-compose.prod.yml exec db psql -U afyapapo_user -d afyapapo_prod -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Emergency Procedures

1. **Service Restart**
```bash
# Graceful restart
docker-compose -f docker-compose.prod.yml restart

# Force restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

2. **Database Recovery**
```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U afyapapo_user -d afyapapo_prod < backups/backup_YYYYMMDD_HHMMSS.sql
```

3. **Rollback Deployment**
```bash
# Rollback to previous version
git checkout previous-stable-tag
docker-compose -f docker-compose.prod.yml up --build -d
```

This deployment guide provides a comprehensive foundation for running AfyaPapo in production with high availability, security, and performance considerations specific to Tanzania's emergency response requirements.