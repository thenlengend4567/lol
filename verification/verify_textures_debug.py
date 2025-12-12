from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))
        page.on("requestfailed", lambda request: print(f"FAILED: {request.url} {request.failure}"))

        print("Navigating to game.html...")
        page.goto("http://localhost:8000/game.html")

        try:
            page.wait_for_selector("#loadingIndicator", state="hidden", timeout=30000)
            print("Loading finished")
        except Exception as e:
            print(f"Loading timeout: {e}")
            page.screenshot(path="verification/loading_timeout.png")
            return

        page.wait_for_timeout(3000)

        # Navigation
        print("Navigating to Earth...")
        page.click("#nextPlanet")
        page.wait_for_timeout(1000)
        page.click("#nextPlanet")
        page.wait_for_timeout(1000)
        page.click("#nextPlanet") # Earth
        page.wait_for_timeout(2000)

        page.screenshot(path="verification/earth_textures_debug.png")
        print("Screenshot taken")
        browser.close()

if __name__ == "__main__":
    run()
