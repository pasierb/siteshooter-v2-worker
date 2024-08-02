# SiteShooter worker

## How it works

### Direct link embeedding

i.e.

```html
<meta property="og:image" content="https://api.siteshooter.app/shoot?key=###&url=###>
```

Problem

Images are generated asynchronously, but the call to get image is synchronous

## Server provisioning

```bash
apt install -y nodejs npm redis
snap install --devmode chromium

curl -sSL https://raw.githubusercontent.com/pasierb/unsexy-ubuntu/main/scripts/create-deployer-user.sh | bash

```

### local MacOS development

https://dev.to/pixelrena/installing-chromium-on-mac-apple-m2-pro-tutorial-4i4i
