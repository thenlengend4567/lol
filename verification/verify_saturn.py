from playwright.sync_api import sync_playwright

def verify_saturn_rings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Increase default timeout
        page.set_default_timeout(60000)

        # Navigate to the local server
        page.goto("http://localhost:8000/game.html")

        # Check if loading indicator is present
        if page.is_visible("#loadingIndicator"):
            print("Loading indicator visible, waiting for it to hide...")
            # Wait for loading to finish (the loading indicator should disappear)
            # This might fail if textures fail to load (network).
            # The app has a `loadingIndicator` text update on error.
            # "Error loading: ... Check console."

            try:
                page.wait_for_selector("#loadingIndicator", state="hidden", timeout=60000)
            except Exception as e:
                print("Loading indicator did not disappear. Checking content.")
                text = page.text_content("#loadingIndicator")
                print(f"Loading indicator text: {text}")
                # If error, we might still proceed if init() was called partially?
                # But typically error stops init.
                # However, the code handles onError by displaying message.

                # Check if we can proceed.
                # The code:
                # loadingManager.onLoad calls init().
                # If loading fails, onError updates text, onLoad might NOT run?
                # Actually, LoadingManager calls onLoad when ALL items are loaded (or failed?).
                # Docs say: onLoad: Will be called when all items finish loading.
                # So even with errors, it might eventually finish?
                # But if a texture 404s, does it count as finished? Yes.

                # If the loading indicator is still there, maybe it's stuck.
                pass

        # Wait for Three.js to initialize (checking for canvas)
        try:
            page.wait_for_selector("canvas", state="visible")
        except:
             print("Canvas not found.")
             page.screenshot(path="verification/error_state.png")
             browser.close()
             return

        # Cycle through planets to find Saturn
        print("Cycling through planets to find Saturn...")
        for i in range(25): # Increased count just in case
            page.click("#nextPlanet")
            page.wait_for_timeout(500) # Wait for transition
            name = page.text_content("#infoName")
            print(f"Current focus: {name}")
            if name == "Saturn":
                break

        # Wait for camera to settle
        page.wait_for_timeout(2000)

        # Take screenshot
        page.screenshot(path="verification/saturn_rings.png")
        print("Screenshot saved to verification/saturn_rings.png")

        browser.close()

if __name__ == "__main__":
    verify_saturn_rings()
