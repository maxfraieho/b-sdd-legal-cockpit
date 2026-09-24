#!/usr/bin/env python3
"""
B-SDD Legal Dossier -> EPUB 3.0 Compiler.
100% Pure Python Standard Library (zipfile, xml, html, re).
Compliant with B-SDD Methodology v1.2, ADR-002 (Zero Third-Party Dependencies).
Generates valid, Kindle-compatible EPUB 3.0 ebooks from legal markdown dossiers.
"""
import argparse
import html
import os
import re
import sys
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path


def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', str(s))]


def md_to_html(md_text: str) -> str:
    """Pure stdlib Markdown to clean semantic HTML converter."""
    lines = md_text.splitlines()
    html_out = []
    in_list = False
    in_code = False
    code_buf = []

    for line in lines:
        stripped = line.strip()

        # Fenced code blocks
        if stripped.startswith("```"):
            if in_code:
                in_code = False
                html_out.append(f"<pre><code>{html.escape(chr(10).join(code_buf))}</code></pre>")
                code_buf = []
            else:
                in_code = True
                code_buf = []
            continue

        if in_code:
            code_buf.append(line)
            continue

        # Close list if not in list item
        if in_list and not (stripped.startswith("- ") or stripped.startswith("* ") or re.match(r"^\d+\.\s", stripped)):
            html_out.append("</ul>")
            in_list = False

        if not stripped:
            continue

        # Headings
        if stripped.startswith("### "):
            html_out.append(f"<h3>{html.escape(stripped[4:])}</h3>")
        elif stripped.startswith("## "):
            html_out.append(f"<h2>{html.escape(stripped[3:])}</h2>")
        elif stripped.startswith("# "):
            html_out.append(f"<h1>{html.escape(stripped[2:])}</h1>")
        # Blockquote
        elif stripped.startswith("> "):
            html_out.append(f"<blockquote><p>{html.escape(stripped[2:])}</p></blockquote>")
        # Unordered list
        elif stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list:
                html_out.append("<ul>")
                in_list = True
            content = html.escape(stripped[2:])
            # Inline bold / italic
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            content = re.sub(r"\*(.+?)\*", r"<em>\1</em>", content)
            html_out.append(f"<li>{content}</li>")
        # Horizontal rule
        elif stripped in ("---", "***", "___"):
            html_out.append("<hr/>")
        # Regular paragraph
        else:
            content = html.escape(line)
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            content = re.sub(r"\*(.+?)\*", r"<em>\1</em>", content)
            content = re.sub(r"`(.+?)`", r"<code>\1</code>", content)
            html_out.append(f"<p>{content}</p>")

    if in_list:
        html_out.append("</ul>")
    if in_code:
        html_out.append(f"<pre><code>{html.escape(chr(10).join(code_buf))}</code></pre>")

    return "\n".join(html_out)


def compile_dossier_to_epub(dossier_dir: Path, output_file: Path, title: str = "Dossier Judiciaire · Canton de Vaud", author: str = "B-SDD Legal Co-Pilot"):
    dossier_dir = Path(dossier_dir).resolve()
    output_file = Path(output_file).resolve()

    if not dossier_dir.exists():
        raise FileNotFoundError(f"Dossier directory not found: {dossier_dir}")

    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Find markdown files
    md_files = sorted(list(dossier_dir.rglob("*.md")), key=lambda p: natural_sort_key(p.name))
    if not md_files:
        # Check for .txt or other docs
        md_files = sorted(list(dossier_dir.rglob("*.txt")), key=lambda p: natural_sort_key(p.name))

    if not md_files:
        # Create a default overview chapter if empty
        chapters_data = [("01_overview.xhtml", "Sommaire du Dossier", f"<h1>Sommaire du Dossier</h1><p>Dossier benchmark initialisé: {dossier_dir.name}</p>")]
    else:
        chapters_data = []
        for i, f in enumerate(md_files, 1):
            text = f.read_text(encoding="utf-8", errors="replace")
            # Extract title
            h1_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
            ch_title = h1_match.group(1).strip() if h1_match else f.stem.replace("_", " ").title()
            ch_html = md_to_html(text)
            ch_filename = f"chapter_{i:03d}.xhtml"
            chapters_data.append((ch_filename, ch_title, ch_html))

    book_uuid = str(uuid.uuid4())
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    css_content = """
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 5%; line-height: 1.6; color: #111; }
    h1 { color: #1a365d; border-bottom: 2px solid #2b6cb0; padding-bottom: 0.3em; margin-top: 1.5em; }
    h2 { color: #2b6cb0; margin-top: 1.3em; }
    h3 { color: #2d3748; margin-top: 1em; }
    blockquote { border-left: 4px solid #cbd5e0; padding-left: 1em; color: #4a5568; font-style: italic; margin: 1em 0; }
    code { font-family: "JetBrains Mono", Consolas, monospace; background: #edf2f7; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #edf2f7; padding: 1em; overflow-x: auto; border-radius: 4px; }
    ul { padding-left: 1.5em; }
    li { margin-bottom: 0.3em; }
    hr { border: 0; height: 1px; background: #e2e8f0; margin: 2em 0; }
    """

    # Generate container.xml
    container_xml = """<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>"""

    # Generate content.opf
    manifest_items = [
        '<item id="style" href="style.css" media-type="text/css"/>',
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
    ]
    spine_items = []

    for fname, _, _ in chapters_data:
        cid = Path(fname).stem
        manifest_items.append(f'<item id="{cid}" href="{fname}" media-type="application/xhtml+xml"/>')
        spine_items.append(f'<itemref idref="{cid}"/>')

    content_opf = f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">urn:uuid:{book_uuid}</dc:identifier>
    <dc:title>{html.escape(title)}</dc:title>
    <dc:creator>{html.escape(author)}</dc:creator>
    <dc:language>fr</dc:language>
    <dc:date>{date_str}</dc:date>
    <meta property="dcterms:modified">{date_str}</meta>
  </metadata>
  <manifest>
    {chr(10).join("    " + item for item in manifest_items)}
  </manifest>
  <spine>
    {chr(10).join("    " + item for item in spine_items)}
  </spine>
</package>"""

    # Generate nav.xhtml
    nav_links = [f'<li><a href="{fname}">{html.escape(ch_title)}</a></li>' for fname, ch_title, _ in chapters_data]
    nav_xhtml = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="fr">
  <head>
    <title>Table des Matières</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table des Matières</h1>
      <ol>
        {chr(10).join("        " + link for link in nav_links)}
      </ol>
    </nav>
  </body>
</html>"""

    # Assemble ZIP file
    with zipfile.ZipFile(output_file, "w") as zf:
        # 1. mimetype (first, uncompressed)
        zf.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        # 2. META-INF/container.xml
        zf.writestr("META-INF/container.xml", container_xml, compress_type=zipfile.ZIP_DEFLATED)
        # 3. OEBPS content
        zf.writestr("OEBPS/content.opf", content_opf, compress_type=zipfile.ZIP_DEFLATED)
        zf.writestr("OEBPS/style.css", css_content, compress_type=zipfile.ZIP_DEFLATED)
        zf.writestr("OEBPS/nav.xhtml", nav_xhtml, compress_type=zipfile.ZIP_DEFLATED)

        for fname, ch_title, ch_body in chapters_data:
            doc_xhtml = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
  <head>
    <title>{html.escape(ch_title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    {ch_body}
  </body>
</html>"""
            zf.writestr(f"OEBPS/{fname}", doc_xhtml, compress_type=zipfile.ZIP_DEFLATED)

    return output_file


def main():
    parser = argparse.ArgumentParser(description="Compile legal dossier to standard EPUB 3.0.")
    parser.add_argument("--dossier", required=True, help="Path to input dossier benchmark directory.")
    parser.add_argument("--output", required=True, help="Path to destination EPUB file.")
    parser.add_argument("--title", default="Dossier Judiciaire · Canton de Vaud", help="Ebook title.")
    parser.add_argument("--author", default="B-SDD Legal Co-Pilot", help="Ebook author.")
    args = parser.parse_args()

    out = compile_dossier_to_epub(
        dossier_dir=Path(args.dossier),
        output_file=Path(args.output),
        title=args.title,
        author=args.author
    )
    print(f"[SUCCESS] Legal EPUB compiled successfully: {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
