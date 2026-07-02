#!/usr/bin/env python3
"""Generate product alt-text update CSV from products_export_1.csv"""

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "products_export_1.csv"
OUTPUT = ROOT / "products_alt_text_update.csv"

def main():
    seen = set()
    rows_out = []

    with open(INPUT, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            handle = row.get("Handle", "")
            if not handle or handle in seen:
                continue
            seen.add(handle)
            title = row.get("Title", handle)
            alt = f"{title} - منتج أصلي من أنفاس العنود"
            rows_out.append({
                "Handle": handle,
                "Title": title,
                "Image Alt Text": alt,
                "SEO Title": f"{title} | أنفاس العنود",
                "SEO Description": f"اشتري {title} من متجر أنفاس العنود. توصيل سريع لجميع الإمارات.",
            })

    if not rows_out:
        print("No products found")
        return

    with open(OUTPUT, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows_out[0].keys())
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Wrote {len(rows_out)} products to {OUTPUT}")

if __name__ == "__main__":
    main()
