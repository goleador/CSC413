"""Session 17: writes slides.md, the plain-text source of record, from slides.html.

The converter is session 16's (diagrams/render.py), plus images, row reveals,
and bash or markdown code blocks.
"""

import html
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent


def _inline(s: str) -> str:
    s = re.sub(r"<code>(.*?)</code>", lambda m: "`" + html.unescape(m.group(1)) + "`", s, flags=re.S)
    s = re.sub(r"</?strong>", "**", s)
    s = re.sub(r"</?em>", "*", s)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def slides_md(deck: str) -> str:
    """One block per slide, in deck order; reveals marked; speaker notes as a quote."""
    out = []
    for body in re.findall(r'<section class="slide[^"]*">(.*?)</section>', deck, re.S):
        notes = re.search(r'<aside class="notes">(.*?)</aside>', body, re.S)
        body = re.sub(r'<aside class="notes">.*?</aside>', "", body, flags=re.S)
        body = re.sub(r"<!-- svg:(\w+) -->.*?<!-- /svg:\w+ -->",
                      lambda m: f"<diagram>{m.group(1)}</diagram>", body, flags=re.S)
        body = re.sub(r"<!-- /?code[^>]*-->", "", body)
        lines = []
        for m in re.finditer(r"<(h1|h2|h3|p|li|pre|table|blockquote|diagram)(\s[^>]*)?>(.*?)</\1>|<img\s([^>]*)>", body, re.S):
            if m.group(4):
                a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(4)))
                lines.append(f"![{a.get('alt', '')}]({a.get('src', '')})")
                continue
            tag, attrs, inner = m.group(1), m.group(2) or "", m.group(3)
            rev = "*(reveal)* " if "reveal" in attrs else ""
            if tag == "diagram":
                lines.append(f"![{inner}](diagrams/svg/{inner}.svg)")
            elif tag in ("h1", "h2", "h3"):
                lines.append("#" * int(tag[1]) + " " + _inline(inner))
            elif tag == "p":
                text = _inline(inner)
                lines.append(rev + (f"**{text}**" if "kicker" in attrs else text))
            elif tag == "li":
                lines.append("- " + rev + _inline(inner))
            elif tag == "blockquote":
                lines.append("> " + _inline(inner))
            elif tag == "pre":
                code = html.unescape(re.sub(r"</?code>", "", inner)).strip("\n")
                lang = ("" if "output" in attrs else "markdown" if code.lstrip().startswith("#")
                        else "bash" if code.startswith("git ") else "java")
                lines.append(("*(reveal)*\n\n" if rev else "") + f"```{lang}\n" + code + "\n```")
            elif tag == "table":
                for i, (rattrs, row) in enumerate(re.findall(r"<tr([^>]*)>(.*?)</tr>", inner, re.S)):
                    cells = [("*(reveal)* " if "reveal" in a + (rattrs if j == 0 else "") else "") + _inline(c)
                             for j, (a, c) in enumerate(re.findall(r"<t[hd]([^>]*)>(.*?)</t[hd]>", row, re.S))]
                    lines.append("| " + " | ".join(cells) + " |")
                    if i == 0:
                        lines.append("|" + "---|" * len(cells))
        block = re.sub(r"\n\n(- |\|)", r"\n\1", "\n\n".join(lines))
        if notes:
            block += "\n\n> " + _inline(notes.group(1))
        out.append(block)
    return "\n\n---\n\n".join(out) + "\n"



if __name__ == "__main__":
    deck = (HERE.parent / "slides.html").read_text()
    (HERE.parent / "slides.md").write_text(slides_md(deck))
