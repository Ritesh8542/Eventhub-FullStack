# EventHub — AWS Deployment Guide (ap-south-1 / Mumbai)

> **Cost warning first:** EC2 `t2.micro`/`t3.micro` (750 hrs/month) and 8 GB EBS are free-tier eligible for 12 months. An **Application Load Balancer (~$16–20/month) and a second EC2 instance are NOT free** — create ALB/ASG only for the demo, then delete them. Set a billing alarm at $5 in Billing → Budgets before you start.
>
> **Security:** enable MFA on the root account, never use root for daily work, never paste AWS keys into code — S3 access here uses an **IAM role attached to EC2**.

## Phase 3 — Account & security (AWS Console)

1. Sign in, switch region (top-right) to **Asia Pacific (Mumbai) ap-south-1**.
2. IAM → Users → create an admin IAM user for yourself, enable MFA (root + IAM user).
3. Billing → Budgets → create a $5 budget alert to your email.

## Phase 4 — Infrastructure (AWS Console)

### VPC — VPC → Create VPC
- Name `eventhub-vpc`, IPv4 CIDR `10.0.0.0/16`, Tenancy Default. Create.
- Subnets → Create subnet (in `eventhub-vpc`): `eventhub-public-1a` `10.0.1.0/24` in `ap-south-1a`, `eventhub-public-1b` `10.0.2.0/24` in `ap-south-1b`; also `eventhub-private-1a` `10.0.11.0/24`, `eventhub-private-1b` `10.0.12.0/24`.
- Internet Gateways → Create `eventhub-igw` → Attach to `eventhub-vpc`.
- Route Tables → create `eventhub-public-rt`, add route `0.0.0.0/0 → eventhub-igw`, associate the two public subnets. Private subnets keep only the local route.
- Security Groups → create `eventhub-alb-sg`: inbound HTTP 80 + HTTPS 443 from `0.0.0.0/0`. Create `eventhub-ec2-sg`: inbound HTTP 80 from `eventhub-alb-sg` only, SSH 22 from **your IP only** (never `0.0.0.0/0`).

### IAM role — IAM → Roles → Create role
- Trusted entity: AWS service → EC2. Attach the policy in `aws/iam-role-policy.json` (create it under IAM → Policies first — least-privilege S3 access to your bucket only). Name: `eventhub-ec2-role`.

### S3 — S3 → Create bucket
- Name: globally unique, e.g. `eventhub-images-<your-name>-ap-south-1`, region `ap-south-1`. **Block all public access: ON.** No public bucket policy — EC2 reaches it only via the IAM role. Note the name into `backend/.env` as `AWS_S3_BUCKET`.

### EC2 — EC2 → Launch instance
- Name `eventhub-app-1`, AMI Ubuntu Server 22.04 LTS, instance type `t2.micro` (free tier), key pair (create/download `.pem`, keep it safe), VPC `eventhub-vpc`, subnet `eventhub-public-1a`, **Auto-assign public IP: Enable**, security group `eventhub-ec2-sg`, IAM role `eventhub-ec2-role`.
- Storage: 8 GB gp3 root volume (EBS). Optionally add a second 8 GB EBS volume, then on the instance: `sudo mkfs -t ext4 /dev/xvdf && sudo mkdir /data && sudo mount /dev/xvdf /data` (add to `/etc/fstab` with its UUID so it survives reboot — this is the EBS persistence demo).
- Advanced → User data: paste `aws/ec2-user-data.sh` (edit the GitHub repo URL inside it first).

## Phase 5 — Application deployment (your local terminal / SSH)

```bash
# SSH in (replace with your key + public IP/DNS)
ssh -i ~/eventhub-key.pem ubuntu@<EC2-PUBLIC-IP>

# The user-data script already installs Node 20, Nginx, Git, PM2, clones the
# repo, installs deps and builds the frontend. If you need to do it manually:
cd ~/eventhub
cd backend && cp .env.example .env   # then edit: JWT_SECRET, MONGODB_URI, AWS_S3_BUCKET
npm install && pm2 start ecosystem.config.js --env production
cd ../frontend && npm install && npm run build
sudo cp aws/nginx-eventhub.conf /etc/nginx/sites-available/eventhub
sudo ln -s /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
curl http://localhost/api/health   # expect {"status":"ok",...}
```

Open `http://<EC2-PUBLIC-IP>/` in a browser — the app should load.

## Phase 7 — Load Balancer & Auto Scaling (AWS Console)

1. EC2 → Launch Templates → Create `eventhub-template` from the working instance config (AMI = your instance's AMI, or a golden AMI you create from it via Actions → Image → Create image), user data = `aws/ec2-user-data.sh`, IAM role `eventhub-ec2-role`, SG `eventhub-ec2-sg`.
2. EC2 → Target Groups → Create `eventhub-tg`, protocol HTTP port 80, VPC `eventhub-vpc`, health-check path `/api/health`, healthy threshold 2.
3. EC2 → Load Balancers → Create Application Load Balancer `eventhub-alb`, internet-facing, VPC + both public subnets, SG `eventhub-alb-sg`, listener HTTP 80 → forward to `eventhub-tg`.
4. EC2 → Auto Scaling Groups → Create `eventhub-asg`, Launch Template `eventhub-template`, VPC + both public subnets, attach to `eventhub-tg`, min 1 / desired 1 / max 2, scaling policy: target-tracking on average CPU 50%.
5. Test: open the **ALB DNS name**, register for an event, upload an image (check it lands in S3), then terminate one instance from the ASG and watch it be replaced; raise load/CPU to watch a second instance appear.
6. **After the demo, delete in this order:** ASG → ALB → Target Group → EC2 instances → EBS volumes → S3 objects/bucket, to stop charges.

## Verification checklist (Phase 8)

- [ ] `/api/health` returns ok via ALB DNS name
- [ ] Register / login / logout work; admin login works
- [ ] 6 seeded events list; search + category filter work
- [ ] Booking succeeds, duplicate booking is rejected, cancel works
- [ ] Admin can create/edit/delete an event; image upload appears in S3 (or `/uploads/`)
- [ ] Stopping one EC2 instance: ALB still serves traffic; ASG replaces it
- [ ] `curl` from an instance with no keys can `aws s3 ls` only the EventHub bucket (IAM least-privilege)
