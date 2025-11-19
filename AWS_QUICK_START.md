# ⚡ AWS Quick Start - 3 Steps Only

## Step 1: Create EC2 (5 min)
1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Launch Instance"**
3. Settings:
   - Name: `pixivloader`
   - OS: **Ubuntu Server 22.04 LTS**
   - Instance: **t3.micro** (free tier, 1GB RAM, 2 vCPUs)
   - Key pair: Create new → Download `.pem` file
   - Security group: Allow ports **22, 80, 443**
4. Click **"Launch"**
5. Copy your **Public IP address**

## Step 2: Connect (2 min)

**Open PowerShell and run:**
```powershell
cd Downloads
icacls pixivloader-key.pem /inheritance:r
icacls pixivloader-key.pem /grant:r "${env:USERNAME}:(R)"
```

**IMPORTANT: Add SSH port to security group first!**
1. AWS Console → EC2 → Your instance → Security tab
2. Click security group → Edit inbound rules → Add rule
3. Type: SSH, Port: 22, Source: My IP
4. Save rules

**Then connect:**
```powershell
ssh -i pixivloader-key.pem ubuntu@YOUR_EC2_IP
```
Replace `YOUR_EC2_IP` with your actual IP address.

## Step 3: Run Setup Script (10 min)

**Create the script (wget doesn't work yet):**
```bash
nano aws-setup.sh
```

1. Open `aws-setup.sh` from your project folder on Windows
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. Right-click in terminal to paste (or Shift+Insert)
4. Press `Ctrl + X` → `Y` → `Enter`

**Make executable and run:**
```bash
chmod +x aws-setup.sh
./aws-setup.sh
```

**When prompted for environment variables, paste (replace YOUR_EC2_IP):**
```env
PORT=5000
FLASK_ENV=production
SUPABASE_URL=https://qkxauxnpwbshsjbbonrt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGF1eG5wd2JzaHNqYmJvbnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzU1NjIsImV4cCI6MjA3OTA1MTU2Mn0.-_D-BtttlVwQMuwaKERqQTj3PCZNu9_HOq-c091g_fs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGF1eG5wd2JzaHNqYmJvbnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzU1NjIsImV4cCI6MjA3OTA1MTU2Mn0.-_D-BtttlVwQMuwaKERqQTj3PCZNu9_HOq-c091g_fs
FRONTEND_URL=http://YOUR_EC2_IP
PIXIV_PHPSESSID=107895576_FNUmaOI5U7gYh7dYv1ap6j8YDAmwrfEM
```

## Done! 🎉

Visit: `http://YOUR_EC2_IP`

---

## Useful Commands

**View logs:**
```bash
sudo journalctl -u pixivloader -f
```

**Restart services:**
```bash
sudo systemctl restart pixivloader
sudo systemctl restart nginx
```

**Update code:**
```bash
cd /opt/Pixivloader
sudo git pull
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl restart pixivloader
```

---

## Troubleshooting

**Can't connect via SSH?**
- Check security group allows port 22 from your IP
- Make sure instance is running

**Frontend not loading?**
```bash
sudo systemctl status nginx
```

**Backend errors?**
```bash
sudo journalctl -u pixivloader -n 50
```

**Need more details?** Check `AWS_DEPLOY_COMPLETE.md`
