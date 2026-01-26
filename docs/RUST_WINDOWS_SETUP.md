# Rust Installation on Windows

## Prerequisites

Rust on Windows requires the Microsoft C++ Build Tools (linker and Windows SDK libraries).

## Installation Options

### Option 1: Visual Studio Community (Recommended - Easiest)

1. Download Visual Studio Community (free):
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Download "Visual Studio Community" (free for individuals)

2. During installation, select:
   - **Desktop development with C++** workload
   - This includes:
     - MSVC v143 compiler toolset
     - Windows 10/11 SDK
     - C++ CMake tools

3. After Visual Studio installs, run Rust installer again:
   ```powershell
   # Download and run rustup-init.exe from https://rustup.rs/
   ```

### Option 2: Microsoft C++ Build Tools (Standalone - Smaller)

If you don't want the full Visual Studio IDE:

1. Download Build Tools for Visual Studio:
   - Go to: https://visualstudio.microsoft.com/downloads/
   - Scroll down to "Tools for Visual Studio"
   - Download "Build Tools for Visual Studio"

2. During installation, select:
   - **C++ build tools** workload
   - This includes the MSVC compiler and Windows SDK

3. After installation, run Rust installer again

### Option 3: Manual Prerequisites (Advanced)

Only if you need specific control over what's installed.

### Option 4: GNU ABI (Not Recommended)

Only use if you're specifically targeting MinGW/GNU toolchain. Not recommended for Windows development.

## Recommended Path

**For most developers:** Choose **Option 1** (Visual Studio Community) or **Option 2** (Build Tools).

Both are free and will give you everything you need. Visual Studio Community also includes a great IDE if you want to use it later.

## After Installing Prerequisites

1. **Restart your terminal/command prompt** (important!)

2. Run Rust installer:
   ```powershell
   # If you haven't downloaded rustup-init.exe yet:
   # Visit https://rustup.rs/ and download rustup-init.exe
   
   # Then run it:
   .\rustup-init.exe
   ```

3. When prompted, choose:
   - Default installation (press Enter)
   - This will install Rust to `C:\Users\<YourName>\.cargo\`

4. Verify installation:
   ```powershell
   rustc --version
   cargo --version
   ```

5. Add to PATH (usually automatic, but verify):
   - Rust should automatically add `C:\Users\<YourName>\.cargo\bin` to your PATH
   - If not, add it manually to System Environment Variables

## Quick Command Reference

After Rust is installed:

```powershell
# Verify installation
rustc --version
cargo --version

# Build the matter-core project
cd packages\matter-core
cargo build

# Run tests
cargo test

# Check for updates
rustup update
```

## Troubleshooting

### "linker not found" error
- Make sure you installed the C++ build tools
- Restart your terminal after installation
- Verify PATH includes Cargo bin directory

### "cannot find -lmsvcrt" error
- You need the Windows SDK
- Reinstall Visual Studio Build Tools with Windows SDK selected

### Rust installed but commands not found
- Restart terminal/IDE
- Check PATH: `$env:PATH -split ';' | Select-String cargo`
- Manually add `C:\Users\<YourName>\.cargo\bin` to PATH if needed

## Next Steps After Rust Installation

1. Verify Rust works:
   ```powershell
   cargo --version
   ```

2. Build matter-core:
   ```powershell
   cd packages\matter-core
   cargo build
   ```

3. Run setup check again:
   ```powershell
   .\scripts\setup-check.ps1
   ```

---

**Note:** The Visual Studio Community installer is large (~3-4 GB) but it's a one-time download and includes everything you'll need for Rust development on Windows.
