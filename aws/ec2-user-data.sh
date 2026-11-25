#!/bin/bash
# EventHub EC2 user-data — Ubuntu 22.04. Runs as root on first boot.
# EDIT THIS LINE: your GitHub repo URL:
REPO_URL="https://github.com/<your-username>/eventhub.git"
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git nginx curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
cd /home/ubuntu
if [ ! -d eventhub ]; then git clone "$REPO_URL" eventhub; fi
cd eventhub/backend && npm install
# Create .env from the example — EDIT the values afterwards (JWT_SECRET etc.)
[ -f .env ] || cp .env.example .env
cd ../frontend && npm install && npm run build
sudo cp ../aws/nginx-eventhub.conf /etc/nginx/sites-available/eventhub 2>/dev/null || cp aws/nginx-eventhub.conf /etc/nginx/sites-available/eventhub
ln -sf /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/eventhub
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
cd /home/ubuntu/eventhub/backend && pm2 start ecosystem.config.js --env production || pm2 start server.js --name eventhub-backend
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
echo "EventHub user-data done"
