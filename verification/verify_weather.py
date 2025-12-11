from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000/game.html")
        page.wait_for_selector("canvas", timeout=30000)
        page.wait_for_timeout(2000)

        # Check if "Weather System" folder exists in dat.GUI
        # dat.GUI usually creates list items with text.
        weather_folder = page.get_by_text("Weather System")
        if weather_folder.count() > 0:
            print("Weather System folder found.")
            weather_folder.click() # Open folder
            page.wait_for_timeout(1000)

            # Check for Cloud Speed
            if page.get_by_text("Cloud Speed").count() > 0:
                print("Cloud Speed control found.")
            else:
                print("Cloud Speed control NOT found.")

            if page.get_by_text("Storm Intensity").count() > 0:
                print("Storm Intensity control found.")
            else:
                print("Storm Intensity control NOT found.")

            page.screenshot(path="verification/weather_gui.png")
        else:
            print("Weather System folder NOT found.")
            page.screenshot(path="verification/no_weather_gui.png")

        browser.close()

if __name__ == "__main__":
    run()
