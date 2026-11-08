"""Builds dist/exam-platform.html: one self-contained file (CSS and JS inlined)."""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="css/style.css">',
              lambda m: "<style>\n" + (root / "css/style.css").read_text(encoding="utf-8") + "</style>", html)
import urllib.parse
svg = (root / "favicon.svg").read_text(encoding="utf-8").strip()
html = html.replace('href="favicon.svg"', 'href="data:image/svg+xml,' + urllib.parse.quote(svg) + '"')
html = re.sub(r'<script src="(js/[^"]+)"></script>',
              lambda m: "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "\n</script>", html)
(root / "dist").mkdir(exist_ok=True)
(root / "dist/exam-platform.html").write_text(html, encoding="utf-8")
print("built dist/exam-platform.html", len(html), "bytes")
