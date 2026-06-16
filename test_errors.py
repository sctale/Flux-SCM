from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    errors = []
    page.on('console', lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)
    page.on('pageerror', lambda err: errors.append(f"[PAGE_ERROR] {err}"))

    page.goto('http://localhost:5173', timeout=15000)
    page.wait_for_load_state('networkidle', timeout=15000)
    page.screenshot(path='/workspace/test_home.png', full_page=True)

    routes = [
        '/suppliers', '/materials', '/cost/tco', '/cost/should-cost',
        '/cost/scorecards', '/procurement/optimization', '/procurement/strategy',
        '/settings'
    ]

    for route in routes:
        try:
            page.goto(f'http://localhost:5173{route}', timeout=10000)
            page.wait_for_load_state('networkidle', timeout=10000)
            page.wait_for_timeout(1500)
            fname = route.replace("/", "_")
            page.screenshot(path=f'/workspace/test{fname}.png', full_page=True)
        except Exception as ex:
            print(f"FAIL {route}: {ex}")

    print("=== ALL ERRORS ===")
    for e in errors:
        print(e)

    browser.close()
