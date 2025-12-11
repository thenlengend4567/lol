from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/game.html")
        page.wait_for_selector("canvas", timeout=30000)
        # Wait a bit for things to render
        page.wait_for_timeout(5000)
        page.screenshot(path="verification/initial_state.png")
        browser.close()

if __name__ == "__main__":
    run()
