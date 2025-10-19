# 🐛 VS Code Debugging Guide

## 🚀 Quick Start

### **1. Open VS Code in Root Directory**
```bash
# From the project root (health-platform)
code .
```

### **2. Start Debugging**
- **Press F5** or go to **Run → Start Debugging**
- **Select configuration**:
  - **"Debug FastAPI Backend"** - Basic debugging (start Docker manually first)
  - **"Debug FastAPI (Auto Docker)"** - Auto-starts Docker services before debugging

### **3. Set Breakpoints**
- Click in the **left margin** next to line numbers in your Python files
- **Red dots** will appear indicating breakpoints

### **4. Test Your Breakpoints**
- Call API endpoints via Postman, browser, or API docs
- Execution will **pause at your breakpoints**

---

## 🎯 Debug Configurations

### **Configuration 1: "Debug FastAPI Backend"**
- **Use when**: Docker services are already running
- **Manual setup**: Run `docker-compose up -d` first
- **Best for**: Quick debugging sessions

### **Configuration 2: "Debug FastAPI (Auto Docker)"**
- **Use when**: Starting fresh
- **Auto setup**: Starts Docker services automatically
- **Best for**: First-time debugging or after restart

---

## 🛠️ Debug Features

| Feature | Shortcut | Description |
|---------|----------|-------------|
| **Set Breakpoint** | Click margin | Pause execution at specific line |
| **Continue** | F5 | Resume execution |
| **Step Over** | F10 | Execute current line, don't enter functions |
| **Step Into** | F11 | Enter function calls |
| **Step Out** | Shift+F11 | Exit current function |
| **Restart** | Ctrl+Shift+F5 | Restart debug session |
| **Stop** | Shift+F5 | Stop debugging |

---

## 🔍 Debugging Tools

### **Variables Panel**
- **View all variables** in current scope
- **Inspect values** by hovering over code
- **Edit values** during debugging

### **Watch Panel**
- **Monitor specific variables** across breakpoints
- **Add expressions** to watch
- **Update in real-time**

### **Call Stack**
- **See execution path** from current breakpoint
- **Navigate between stack frames**
- **Understand function call hierarchy**

### **Debug Console**
- **Execute Python expressions** during debugging
- **Test code snippets** in current context
- **Inspect variables** with commands

---

## 🎯 Common Debug Scenarios

### **Debug API Endpoints**
1. Set breakpoint in endpoint function
2. Start debug session (F5)
3. Call API endpoint (Postman/browser)
4. Execution pauses at breakpoint
5. Inspect request data, variables, etc.

### **Debug Background Tasks**
1. Set breakpoint in Celery task
2. Start debug session (F5)
3. Trigger task execution
4. Debug task logic step by step

### **Debug Database Operations**
1. Set breakpoint before/after database calls
2. Inspect query results
3. Check database connection state
4. Debug ORM operations

---

## ⚙️ Environment Variables

The debug configurations automatically set:
```bash
DEBUG=true              # Enables debug mode
LOG_LEVEL=debug         # Verbose logging
PYTHONPATH=<project>    # Proper module resolution
REDIS_HOST=localhost    # Connect to Docker Redis
REDIS_PORT=6379
```

---

## 🚨 Troubleshooting

### **"No module named 'backend'"**
- Ensure `PYTHONPATH` is set to project root
- Check that you're in the correct directory

### **"Connection refused to Redis"**
- Make sure Docker services are running: `docker-compose up -d`
- Check Redis is accessible on localhost:6379

### **Breakpoints not hit**
- Ensure you're using the correct debug configuration
- Check that the code path is actually executed
- Verify breakpoints are set in the right files

### **FastAPI not reloading**
- The `--reload` flag is enabled in debug config
- Code changes should trigger automatic reload
- If not working, restart debug session

---

## 💡 Pro Tips

1. **Use conditional breakpoints** - Right-click breakpoint → Add condition
2. **Log points** - Right-click margin → Add Logpoint (no pause)
3. **Exception breakpoints** - Break on Python exceptions
4. **Multi-threaded debugging** - Debug Celery workers and API simultaneously
5. **Remote debugging** - Debug deployed applications

---

## 🎉 You're Ready to Debug!

- ✅ **VS Code configured** for FastAPI debugging
- ✅ **Breakpoints working** in your Python code
- ✅ **Docker integration** for Redis/Celery services
- ✅ **Hot reload** for fast development cycles
- ✅ **Full debugging features** available

**Happy debugging!** 🐛✨
