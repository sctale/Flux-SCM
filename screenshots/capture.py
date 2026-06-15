from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    
    # Dashboard
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/workspace/screenshots/dashboard.png', full_page=True)
    
    # Suppliers
    page.goto('http://localhost:5173/suppliers')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/workspace/screenshots/suppliers.png', full_page=True)
    
    # Materials
    page.goto('http://localhost:5173/materials')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/workspace/screenshots/materials.png', full_page=True)
    
    # Orders
    page.goto('http://localhost:5173/orders')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/workspace/screenshots/orders.png', full_page=True)
    
    # Settings
    page.goto('http://localhost:5173/settings')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/workspace/screenshots/settings.png', full_page=True)
    
    browser.close()
    print("All screenshots saved to /workspace/screenshots/")
