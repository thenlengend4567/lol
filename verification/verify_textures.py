from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Since 'game' is a file, the server will serve it as a file download or raw text if content-type is not set to html.
        # But 'game' content is HTML.
        # Usually extensions matter for simple http server.
        # Let's try renaming it temporarily or using 'game.html' if the server recognizes it, or just use correct URL if it's served as default.
        # But wait, if I visit http://localhost:8000/game, python http server sees a file named 'game'. It might serve it as application/octet-stream if it doesn't have an extension.

        # I should rename 'game' to 'game.html' to ensure it's served as HTML, or configure the server.
        # Since I can't easily configure python http server MIME types without code, I'll rename the file.

        page.goto("http://localhost:8000/game.html")

        # Wait for loading to finish
        try:
            expect(page.locator("#loadingIndicator")).to_be_hidden(timeout=10000)
            print("Loading finished")
        except:
            print("Loading timeout or error")
            page.screenshot(path="verification/loading_error.png")

        # Wait a bit for initial animations
        page.wait_for_timeout(3000)

        page.click("#nextPlanet")
        page.wait_for_timeout(2000)
        page.click("#nextPlanet")
        page.wait_for_timeout(2000)
        page.click("#nextPlanet")
        page.wait_for_timeout(2000)

        # Take screenshot of Earth
        page.screenshot(path="verification/earth_textures.png")
        print("Screenshot taken")
        browser.close()

if __name__ == "__main__":
    run()
