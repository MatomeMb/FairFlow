# Quick Rust Setup on Windows - Direct Links

## Problem
Rust installer says: "Rust requires a linker and Windows API libraries but they don't seem to be available."

## Solution: Install C++ Build Tools

### Method 1: Direct Download Link (Easiest)

**Download Build Tools directly:**
- Direct link: https://aka.ms/vs/17/release/vs_buildtools.exe
- This is the Visual Studio 2022 Build Tools installer

**After downloading:**
1. Run `vs_buildtools.exe`
2. When installer opens, select **"C++ build tools"** workload
3. Click "Install"
4. Wait for installation (may take 10-20 minutes)
5. **Restart your computer** (important!)
6. Run `rustup-init.exe` again

### Method 2: Visual Studio Installer (Alternative)

If the direct link doesn't work:

1. Download Visual Studio Installer:
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Click "Download" under **"Visual Studio 2022"** → **"Community"** (free)
   - This downloads `vs_community.exe` (small installer)

2. Run the installer:
   - It will open Visual Studio Installer
   - Click "Modify" or "Install"
   - Select **"Desktop development with C++"** workload
   - Click "Install"

3. After installation:
   - **Restart your computer**
   - Run `rustup-init.exe` again

### Method 3: Using winget (Windows Package Manager)

If you have Windows 10/11 with winget:

```powershell
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Or install Visual Studio Community
winget install Microsoft.VisualStudio.2022.Community
```

Then select "C++ build tools" workload during installation.

## What to Select During Installation

**For Build Tools:**
- ✅ **C++ build tools** (workload)
- ✅ Windows 10/11 SDK (usually auto-selected)
- ✅ MSVC v143 compiler toolset (usually auto-selected)

**For Visual Studio Community:**
- ✅ **Desktop development with C++** (workload)
- This includes everything needed

## After Installation

1. **Restart your computer** (very important!)
2. Open a new terminal/command prompt
3. Run Rust installer:
   ```powershell
   # If you have rustup-init.exe, run it:
   .\rustup-init.exe
   
   # Or download it first:
   # Visit https://rustup.rs/
   ```

4. When prompted:
   - Press Enter for default installation
   - Type `y` and Enter to proceed

5. Verify:
   ```powershell
   rustc --version
   cargo --version
   ```

## Quick Check: Do You Already Have It?

Check if you already have the tools installed:

```powershell
# Check for Visual Studio
Get-ChildItem "C:\Program Files\Microsoft Visual Studio" -ErrorAction SilentlyContinue

# Check for Build Tools
Get-ChildItem "C:\Program Files (x86)\Microsoft Visual Studio" -ErrorAction SilentlyContinue
```

If either exists, you might just need to restart your terminal and run rustup-init again.

## Still Having Issues?

1. Make sure you **restarted your computer** after installing
2. Open a **new** terminal window (don't reuse old one)
3. Try running rustup-init as Administrator:
   ```powershell
   # Right-click PowerShell → Run as Administrator
   .\rustup-init.exe
   ```

## File Sizes

- **Build Tools**: ~1-2 GB download, ~3-4 GB installed
- **Visual Studio Community**: ~3-4 GB download, ~6-8 GB installed

Both are free and work the same for Rust development.
