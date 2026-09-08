#!/usr/bin/env python3
"""Regenerate light.png and dark.png from chart.html.

Requires Python Playwright with Chromium:
    pip install playwright && playwright install chromium
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
SRC = (HERE / "chart.html").as_uri()

with sync_playwright() as p:
    browser = p.chromium.launch()
    for scheme in ("light", "dark"):
        ctx = browser.new_context(
            viewport={"width": 1120, "height": 900},
            device_scale_factor=2,
            color_scheme=scheme,
        )
        page = ctx.new_page()
        page.goto(SRC)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)  # let webfonts settle before capture
        page.locator(".diagram-frame").screenshot(path=HERE / f"{scheme}.png")
        ctx.close()
    browser.close()
print("wrote light.png and dark.png")
