# Test Data for Phase 0 Platform Testing

## What You Need

1. **Test Product Image** - A JPEG or PNG image (minimum 500x500px recommended)
   - You can use any product image you have
   - Or download a test image from Unsplash/Pexels
   - Save it as `test_product.jpg` in this directory

2. **Test .thing File** - Already created as `test_thing.bin`

## Quick Setup

1. Place your test image in this directory as `test_product.jpg`
2. Run the test image generation script from the project root:
   ```powershell
   cd ..\packages\matter-core
   cargo run --bin platform-test -- create-test-images ..\..\test_data\test_product.jpg ..\..\test_data\test_thing.bin ..\..\test_output\
   ```

## Test Image Sources

If you need a test image, you can:
- Use any image you have on your computer
- Download from Unsplash: https://unsplash.com/s/photos/product
- Download from Pexels: https://www.pexels.com/search/product/
- Use a simple colored square image (500x500px minimum)
