"""Draw session 16's diagrams and paste them, and its code, into the deck and notes.

Uses session 14's renderer for boxes, arrows, and sequence diagrams, and
session 15's for cutting code from source. Run after editing a diagram
below, the demo code, the deck, or the notes:

    python3 render.py

- Each region between <!-- svg:NAME --> and <!-- /svg:NAME --> in
  ../slides.html gets the drawing; svg/NAME.svg is written for the notes.
- Each <!-- code:SPEC --> region in ../slides.html and <!-- java:SPEC -->
  region in ../notes.md gets code cut from source. SPEC is
  'variant/File.java' for ../demo/variant, 'starter:path/File.java' for the
  starter at m5, or 'ref:path/File.java' for the reference engine at HEAD;
  '#a,b' selects members, '#api' the public signatures.
"""

from __future__ import annotations

import html
import importlib.util
import pathlib
import re
import subprocess
import sys

sys.dont_write_bytecode = True

HERE = pathlib.Path(__file__).resolve().parent
LECTURES = HERE.parent.parent


def _load(name: str, path: pathlib.Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


s14 = _load("s14", LECTURES / "session-14-uml" / "diagrams" / "render.py")
s15 = _load("s15", LECTURES / "session-15-design-patterns" / "diagrams" / "render.py")

Box, Edge, Seq, class_diagram = s14.Box, s14.Edge, s14.Seq, s14.class_diagram

REFERENCE = LECTURES.parents[1] / "CSC413-chess-reference"
s15.DEMO = HERE.parent / "demo"
_starter_or_demo = s15._source


def _source(path: str) -> str:
    if path.startswith("ref:"):
        rel = "src/main/java/edu/sfsu/csc413/chess/" + path[len("ref:"):]
        return subprocess.run(["git", "-C", str(REFERENCE), "show", f"HEAD:{rel}"],
                              check=True, capture_output=True, text=True).stdout
    return _starter_or_demo(path)


s15._source = _source


# ----------------------------------------------------------------------
# The diagrams
# ----------------------------------------------------------------------

def mvc() -> str:
    model = Box("Model", 330, 260, fields=["Game, and everything", "behind it (M1–M5)"], min_w=250)
    view = Box("View", 20, 40, fields=["BoardView:", "ConsoleView, EmojiView, …"], min_w=250)
    ctrl = Box("Controller", 640, 40, fields=["GameController (M6)"], min_w=250)
    edges = [Edge("association", ("Controller", "b", 0.4), ("Model", "r", 0.4), label="changes it",
                  label_at=(60, 0)),
             Edge("association", ("Controller", "l", 0.4), ("View", "r", 0.4), label="tells it to redraw",
                  label_at=(0, -10)),
             Edge("dependency", ("View", "r", 0.75), ("Controller", "l", 0.75), label="what the player asked for",
                  label_at=(0, 22)),
             Edge("dependency", ("View", "b", 0.6), ("Model", "l", 0.4), label="reads it", label_at=(-50, 0))]
    return class_diagram([model, view, ctrl], edges, "",
                         "MVC: the controller changes the model and tells the view to redraw; "
                         "the view reads the model and reports what the player asked for")


def tictactoe() -> str:
    iface = Box("TicTacToeView", 20, 20, stereotype="interface",
                methods=["+show(TicTacToe)", "+report(Outcome)", "+start(TicTacToeController)"])
    ctrl = Box("TicTacToeController", 560, 20, fields=["-game: TicTacToe", "-view: TicTacToeView"],
               methods=["+start()", "+play(int)"])
    model = Box("TicTacToe", 572, 290, methods=["+cell(int) char", "+turn() char", "+play(int) Outcome"])
    kids = [Box("ConsoleTicTacToeView", 40, 330)]
    edges = [Edge("association", ("TicTacToeController", "l", 0.45), ("TicTacToeView", "r", 0.45), label="view",
                  label_at=(0, -10)),
             Edge("association", ("TicTacToeController", "b", 0.5), ("TicTacToe", "t", 0.5), label="changes",
                  label_at=(48, 0)),
             Edge("dependency", ("ConsoleTicTacToeView", "r", 0.5), ("TicTacToe", "l", 0.6), label="reads",
                  label_at=(0, -10))]
    bus = s15.realization_bus(iface, kids)
    return class_diagram([iface, ctrl, model] + kids, edges, bus,
                         "Class diagram: TicTacToeController holds a TicTacToe and a TicTacToeView; "
                         "ConsoleTicTacToeView implements TicTacToeView and reads TicTacToe; TicTacToe has no arrows out")



# ----------------------------------------------------------------------
# slides.md, the plain-text source of record, written from the deck
# ----------------------------------------------------------------------

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
        for m in re.finditer(r"<(h1|h2|h3|p|li|pre|table|blockquote|diagram)(\s[^>]*)?>(.*?)</\1>", body, re.S):
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
                lang = "" if "output" in attrs else "java"
                lines.append(("*(reveal)*\n\n" if rev else "") + f"```{lang}\n" + code + "\n```")
            elif tag == "table":
                for i, row in enumerate(re.findall(r"<tr>(.*?)</tr>", inner, re.S)):
                    cells = [("*(reveal)* " if "reveal" in a else "") + _inline(c)
                             for a, c in re.findall(r"<t[hd]([^>]*)>(.*?)</t[hd]>", row, re.S)]
                    lines.append("| " + " | ".join(cells) + " |")
                    if i == 0:
                        lines.append("|" + "---|" * len(cells))
        block = re.sub(r"\n\n(- |\| )", r"\n\1", "\n\n".join(lines))
        if notes:
            block += "\n\n> " + _inline(notes.group(1))
        out.append(block)
    return "\n\n---\n\n".join(out) + "\n"


DIAGRAMS = {"mvc": mvc, "tictactoe": tictactoe}


def main() -> None:
    out_dir = HERE / "svg"
    out_dir.mkdir(exist_ok=True)
    slides = HERE.parent / "slides.html"
    html = slides.read_text() if slides.exists() else ""
    for name, make in DIAGRAMS.items():
        # Marker ids must be unique per page.
        drawing = make().replace('id="', f'id="{name}-').replace("url(#", f"url(#{name}-")
        (out_dir / f"{name}.svg").write_text(drawing.replace(
            'style="', 'style="--slide-text:#1a1a1a;--slide-muted:#5a5a68;--code-bg:#f4f4f8;'
            '--slide-bg:#fff;--sfsu-gold:#c99700;background:#fff;', 1))
        pattern = re.compile(rf"(<!-- svg:{re.escape(name)} -->).*?(<!-- /svg:{re.escape(name)} -->)", re.S)
        html = pattern.sub(lambda m: f"{m.group(1)}\n{drawing}\n{m.group(2)}", html)
    notes = HERE.parent / "notes.md"
    text = notes.read_text() if notes.exists() else ""
    html, text = s15.paste_code(html, text)
    if html:
        slides.write_text(html)
        (HERE.parent / "slides.md").write_text(slides_md(html))
    if text:
        notes.write_text(text)


if __name__ == "__main__":
    main()
