# Environment Setup Guide 🔧

## Quick Setup

### 1. Copy Example File
```bash
cp .env.example .env.local
```

### 2. Update Your IP
Find your computer's IP:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### 3. Edit `.env.local`
```bash
API_BASE_URL=http://YOUR_IP_HERE:3002
```

Example:
```bash
API_BASE_URL=http://192.168.1.165:3002
```

### 4. Restart Metro
```bash
npm run start:clean
```

---

## How It Works

Uses `react-native-dotenv` to inject environment variables at build time:

```
.env.local → babel.config.js → @env module → config/env.ts → Your code
```

All values from `.env.local` are available via `import from '@env'`

---

## Files

- `.env.local` - Your values (gitignored ✅)
- `.env.example` - Template (committed ✅)
- `babel.config.js` - Babel plugin config
- `types/env.d.ts` - TypeScript types
- `config/env.ts` - Typed access

---

## Common Issues

**Q: Changes to .env.local not reflecting?**  
A: Restart Metro with cache clear: `npm run start:clean`

**Q: Getting network errors?**  
A: Make sure you're using your computer's IP, not localhost

**Q: Module '@env' not found?**  
A: Make sure babel.config.js is configured and Metro is restarted

---

**Updated:** October 11, 2025

