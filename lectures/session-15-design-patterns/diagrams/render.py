"""Draw session 15's diagrams and paste them, and its code, into the deck and notes.

Uses session 14's renderer for boxes, arrows, and colours. Run after editing
a diagram below, the demo code, or the deck:

    python3 render.py

- Each region between <!-- svg:NAME --> and <!-- /svg:NAME --> in
  ../slides.html gets the drawing; svg/NAME.svg is written for the notes.
- Each <!-- code:SPEC --> region in ../slides.html and <!-- java:SPEC -->
  region in ../notes.md gets code cut from source. SPEC is
  'variant/File.java' for ../demo/variant, or 'starter:path/File.java' for
  the file students have at the starter's m5 tag; '#a,b' selects members.
"""

from __future__ import annotations

import importlib.util
import pathlib
import re
import subprocess
import sys

sys.dont_write_bytecode = True
from typing import List

HERE = pathlib.Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location(
    "s14", HERE.parent.parent / "session-14-uml" / "diagrams" / "render.py")
s14 = importlib.util.module_from_spec(_spec)
sys.modules["s14"] = s14
_spec.loader.exec_module(s14)

Box, Edge, class_diagram, svg, esc = s14.Box, s14.Edge, s14.class_diagram, s14.svg, s14.esc


def realization_bus(parent: Box, children: List[Box], gap: float = 34) -> str:
    """Realization drawn like session 14's inheritance bus, but dashed."""
    px, py = parent.anchor("b")
    bus_y = min(c.y for c in children) - gap
    dash = 'stroke-dasharray="7 5"'
    out = [f'<path d="M{px:.1f},{bus_y:.1f} L{px:.1f},{py:.1f}" fill="none" stroke="var(--slide-text)" '
           f'stroke-width="1.6" {dash} marker-end="url(#triangle)"/>']
    xs = [c.anchor("t")[0] for c in children]
    out.append(f'<line x1="{min(xs + [px]):.1f}" y1="{bus_y:.1f}" x2="{max(xs + [px]):.1f}" y2="{bus_y:.1f}" '
               f'stroke="var(--slide-text)" stroke-width="1.6" {dash}/>')
    for c in children:
        cx, cy = c.anchor("t")
        out.append(f'<line x1="{cx:.1f}" y1="{bus_y:.1f}" x2="{cx:.1f}" y2="{cy:.1f}" '
                   f'stroke="var(--slide-text)" stroke-width="1.6" {dash}/>')
    return "\n".join(out)


def _note(x: float, y: float, text: str, anchor: str = "middle") -> str:
    return (f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" '
            f'style="fill:var(--slide-muted);font-style:italic">{esc(text)}</text>')


def factory() -> str:
    bf = Box("BoardFactory", 20, 20, methods=["+standard() Board$", "+empty() Board$", "+fromFen(String) Board$"])
    pf = Box("PieceFactory", 420, 20, methods=["+create(PieceType, Color) Piece$", "+fromSymbol(char) Piece$"])
    piece = Box("Piece", 0, 220, stereotype="abstract", italic=True, min_w=150)
    kids, x = [], 20
    for n in ("Pawn", "Knight", "Bishop", "Rook", "Queen", "King"):
        b = Box(n, x, 390, min_w=118, min_h=44)
        kids.append(b)
        x += b.w + 22
    piece.x = (kids[0].x + kids[-1].x + kids[-1].w) / 2 - piece.w / 2
    pf.x = piece.x + piece.w / 2 - 60
    edges = [Edge("dependency", ("BoardFactory", "r", 0.5), ("PieceFactory", "l", 0.5), label="fromSymbol", label_at=(0, -10)),
             Edge("dependency", ("PieceFactory", "b", 0.2), ("Piece", "t", 0.7), label="creates", label_at=(40, 0))]
    return class_diagram([bf, pf, piece] + kids, edges, s14.bus_svg(piece, kids),
                         "Factory: BoardFactory asks PieceFactory, which creates the six Piece subclasses")


def factorymethod() -> str:
    dialog = Box("Dialog", 20, 20, stereotype="abstract", italic=True,
                 methods=["#createButton() Button*", "+render(String) String"])
    button = Box("Button", 560, 20, stereotype="interface", methods=["+render(String) String"])
    td = Box("TextDialog", 20, 260, methods=["#createButton() Button"])
    hd = Box("HtmlDialog", 20 + td.w + 30, 260, methods=["#createButton() Button"])
    tb = Box("TextButton", 520, 260, min_w=150, min_h=50)
    hb = Box("HtmlButton", 520 + tb.w + 30, 260, min_w=150, min_h=50)
    dialog.x = (td.x + hd.x + hd.w) / 2 - dialog.w / 2
    button.x = (tb.x + hb.x + hb.w) / 2 - button.w / 2
    edges = [Edge("dependency", ("Dialog", "r", 0.5), ("Button", "l", 0.5), label="uses", label_at=(0, -10))]
    extra = s14.bus_svg(dialog, [td, hd]) + "\n" + realization_bus(button, [tb, hb])
    extra += "\n" + _note(td.x + td.w / 2, td.y + td.h + 24, "returns new TextButton()")
    extra += "\n" + _note(hd.x + hd.w / 2, hd.y + hd.h + 24, "returns new HtmlButton()")
    d = class_diagram([dialog, button, td, hd, tb, hb], edges, extra,
                      "Factory Method: Dialog calls createButton, which TextDialog and HtmlDialog override",
                      margin=40)
    return d


def facade() -> str:
    caller = Box("view, tests, Main", 20, 120, min_w=200, min_h=60)
    game = Box("Game", 330, 40, methods=["+board() Board", "+sideToMove() Color", "+history() List<Move>",
                                         "+legalMoves() List<Move>", "+findLegalMove(String) Optional<Move>",
                                         "+play(Move) void", "+undoLastMove() Optional<Move>"])
    bx = game.x + game.w + 110
    board = Box("Board", bx, 20, min_w=190, min_h=50)
    mg = Box("MoveGenerator", bx, 120, min_w=190, min_h=50)
    bf = Box("BoardFactory", bx, 220, min_w=190, min_h=50)
    edges = [Edge("dependency", ("view, tests, Main", "r", 0.5), ("Game", "l", 0.45)),
             Edge("composition", ("Game", "r", 0.2), ("Board", "l", 0.5)),
             Edge("dependency", ("Game", "r", 0.5), ("MoveGenerator", "l", 0.5)),
             Edge("dependency", ("Game", "r", 0.8), ("BoardFactory", "l", 0.5))]
    top, bottom = 4, max(game.y + game.h, bf.y + bf.h) + 16
    left = game.x - 16
    right = bx + 190 + 16
    extra = (f'<rect x="{left}" y="{top}" width="{right - left}" height="{bottom - top}" rx="8" fill="none" '
             'stroke="var(--slide-muted)" stroke-width="1.4" stroke-dasharray="3 5"/>'
             + _note(right - 10, bottom - 8, "engine", "end"))
    return s14._widen(class_diagram([caller, game, board, mg, bf], edges, extra,
                                    "Facade: callers outside the engine use Game; Board, MoveGenerator and "
                                    "BoardFactory stand behind it"), right + 20)


def command() -> str:
    game = Box("Game", 20, 40, fields=["-Board board", "-List<Move> history"],
               methods=["+play(Move) void", "+undoLastMove() Optional<Move>"])
    move = Box("Move", 460, 40, stereotype="record",
               fields=["+Position from", "+Position to", "+Piece moved", "+Piece captured", "+PieceType promotesTo"])
    board = Box("Board", 20, 330, methods=["+apply(Move) void", "+undo(Move) void"], min_w=game.w)
    piece = Box("Piece", 460, 330, stereotype="abstract", italic=True,
                methods=["+pseudoLegalMoves(Board, Position) List<Move>*"])
    edges = [Edge("association", ("Game", "r", 0.5), ("Move", "l", 0.5), end_mult="0..*", label="history",
                  label_at=(0, -24)),
             Edge("composition", ("Game", "b", 0.5), ("Board", "t", 0.5)),
             Edge("dependency", ("Board", "r", 0.3), ("Move", "b", 0.2)),
             Edge("dependency", ("Piece", "t", 0.6), ("Move", "b", 0.6), label="creates", label_at=(46, 0))]
    extra = "\n".join([_note(game.x + game.w / 2, 30, "invoker"), _note(move.x + move.w / 2, 30, "command"),
                       _note(board.x + board.w / 2, board.y + board.h + 24, "receiver"),
                       _note(piece.x + piece.w / 2, piece.y + piece.h + 24, "client")])
    return class_diagram([game, move, board, piece], edges, extra, margin=40, label=
                         "Command in the engine: Game keeps Moves and has Board apply and undo them; pieces create Moves")


def turnstile() -> str:
    out = []
    w, h, y = 170, 64, 110
    lx, ux = 230, 650
    out.append(f'<circle cx="50" cy="{y + h / 2}" r="11" fill="var(--slide-text)"/>')
    out.append(f'<line x1="62" y1="{y + h / 2}" x2="{lx - 4}" y2="{y + h / 2}" stroke="var(--slide-text)" '
               'stroke-width="1.6" marker-end="url(#open)"/>')
    for name, x in (("Locked", lx), ("Unlocked", ux)):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="var(--code-bg)" '
                   'stroke="var(--slide-text)" stroke-width="1.6"/>')
        out.append(f'<text x="{x + w / 2}" y="{y + h / 2 + 5}" text-anchor="middle" style="font-weight:700">{name}</text>')

    def line(x1, y1, x2, y2, label, ly):
        out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="var(--slide-text)" stroke-width="1.6" '
                   'marker-end="url(#open)"/>')
        out.append(f'<text x="{(x1 + x2) / 2}" y="{ly}" text-anchor="middle">{esc(label)}</text>')

    line(lx + w, y + 20, ux - 2, y + 20, "coin / unlock", y + 8)
    line(ux, y + 44, lx + w + 2, y + 44, "push / let through", y + 70)

    def loop(cx, label, top):
        if top:
            d = f"M{cx - 30},{y} C{cx - 50},{y - 70} {cx + 50},{y - 70} {cx + 30},{y - 2}"
            ty = y - 62
        else:
            d = f"M{cx + 30},{y + h} C{cx + 50},{y + h + 70} {cx - 50},{y + h + 70} {cx - 30},{y + h + 2}"
            ty = y + h + 74
        out.append(f'<path d="{d}" fill="none" stroke="var(--slide-text)" stroke-width="1.6" marker-end="url(#open)"/>')
        out.append(f'<text x="{cx}" y="{ty}" text-anchor="middle">{esc(label)}</text>')

    loop(lx + w / 2, "push / refuse", True)
    loop(ux + w / 2, "coin / return it", False)
    return svg(900, 290, "\n".join(out), "State diagram of a turnstile: Locked and Unlocked, with coin and push")


def stateclasses() -> str:
    gate = Box("Turnstile", 20, 30, fields=["-TurnstileState state"], methods=["+coin() void", "+push() void"])
    st = Box("TurnstileState", 400, 30, stereotype="interface",
             methods=["+coin() TurnstileState", "+push() TurnstileState"])
    locked = Box("Locked", 330, 250, min_w=170, min_h=50)
    unlocked = Box("Unlocked", 330 + 170 + 50, 250, min_w=170, min_h=50)
    st.x = (locked.x + unlocked.x + unlocked.w) / 2 - st.w / 2
    edges = [Edge("association", ("Turnstile", "r", 0.4), ("TurnstileState", "l", 0.5), label="state",
                  label_at=(0, -10))]
    return class_diagram([gate, st, locked, unlocked], edges, realization_bus(st, [locked, unlocked]),
                         "State: Turnstile holds one TurnstileState; Locked and Unlocked implement it")


def decorator() -> str:
    """Class diagram. The two inner arrows go round the outside so no line crosses another."""
    bev = Box("Beverage", 300, 20, stereotype="interface", methods=["+description() String", "+cents() int"])
    milk = Box("Milk", 140, 250, stereotype="record", fields=["-Beverage inner"], min_w=170)
    esp = Box("Espresso", 370, 250, stereotype="record", min_w=170)
    mocha = Box("Mocha", 600, 250, stereotype="record", fields=["-Beverage inner"], min_w=170)
    for b in (esp, milk, mocha):
        b.min_h = milk.h
    bev.x = (milk.x + mocha.x + mocha.w) / 2 - bev.w / 2
    out = [realization_bus(bev, [milk, esp, mocha])]
    by = bev.y + bev.h * 0.6
    for box, side, label in ((milk, "l", "inner"), (mocha, "r", "inner")):
        x1, y1 = box.anchor(side, 0.5)
        bx, _ = bev.anchor(side, 0.6)
        out_x = x1 - 50 if side == "l" else x1 + 50
        out.append(f'<path d="M{x1:.1f},{y1:.1f} L{out_x:.1f},{y1:.1f} L{out_x:.1f},{by:.1f} L{bx:.1f},{by:.1f}" '
                   'fill="none" stroke="var(--slide-text)" stroke-width="1.6" marker-end="url(#open)"/>')
        lx = out_x - 8 if side == "l" else out_x + 8
        anchor = "end" if side == "l" else "start"
        out.append(f'<text x="{lx:.1f}" y="{(y1 + by) / 2:.1f}" text-anchor="{anchor}" '
                   f'style="fill:var(--slide-muted)">{label}</text>')
    return s14._widen(class_diagram([bev, esp, milk, mocha], [], "\n".join(out),
                                    "Decorator: Milk and Mocha are Beverages that each hold a Beverage", margin=30),
                      930)


def _nested(layers, label: str) -> str:
    """Objects wrapped inside one another, outermost first: (name, what this layer does)."""
    out = []
    # The innermost box is one line tall; each layer around it adds a header and a margin.
    x, y, w, h = 20, 20, 860, 52 + 70 * (len(layers) - 1)
    for name, does in layers:
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="var(--code-bg)" '
                   'stroke="var(--slide-text)" stroke-width="1.6"/>')
        out.append(f'<text x="{x + 18}" y="{y + 32}" style="font-weight:700">{esc(name)}</text>')
        out.append(f'<text x="{x + w - 18}" y="{y + 32}" text-anchor="end" style="fill:var(--slide-muted)">'
                   f'{esc(does)}</text>')
        x, y, w, h = x + 40, y + 50, w - 80, h - 70
    return svg(900, 52 + 70 * (len(layers) - 1) + 40, "\n".join(out), label)


def wrapping() -> str:
    return _nested([("Mocha", "adds 75 cents, \", mocha\""), ("Milk", "adds 50 cents, \", milk\""),
                    ("Espresso", "250 cents, \"espresso\"")],
                   "Mocha wraps Milk, which wraps Espresso; each layer adds its part")


def iowrap() -> str:
    return _nested([("BufferedReader", "adds readLine()"), ("InputStreamReader", "turns bytes into characters"),
                    ("System.in", "reads bytes")],
                   "BufferedReader wraps InputStreamReader, which wraps System.in")


def mvc() -> str:
    model = Box("Model", 330, 260, fields=["Game, and everything", "behind it"], min_w=250)
    view = Box("View", 20, 40, fields=["TextBoardRenderer,", "PieceGlyphs; BoardView (M9)"], min_w=250)
    ctrl = Box("Controller", 640, 40, fields=["GameController (M9)"], min_w=250)
    edges = [Edge("association", ("Controller", "b", 0.4), ("Model", "r", 0.4), elbow="", label="changes it",
                  label_at=(60, 0)),
             Edge("association", ("Controller", "l", 0.4), ("View", "r", 0.4), label="tells it to redraw",
                  label_at=(0, -10)),
             Edge("dependency", ("View", "r", 0.75), ("Controller", "l", 0.75), label="what the player asked for",
                  label_at=(0, 22)),
             Edge("dependency", ("View", "b", 0.6), ("Model", "l", 0.4), label="reads it", label_at=(-50, 0))]
    return class_diagram([model, view, ctrl], edges, "",
                         "MVC: the controller changes the model and tells the view to redraw; the view reads the model")


# ----------------------------------------------------------------------
# Code on slides and in notes, cut from the demo source
# ----------------------------------------------------------------------

DEMO = HERE.parent / "demo"
STARTER = HERE.parents[3] / "CSC413-chess-starter"
STARTER_TAG = "m5"


def _strip(source: str) -> List[str]:
    """Drop the package line, imports, and javadoc; keep line comments."""
    source = re.sub(r"[ \t]*/\*\*.*?\*/\n", "", source, flags=re.S)
    lines = [ln for ln in source.splitlines() if not ln.startswith(("package ", "import "))]
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip("\n")
    return text.splitlines()


def _member(lines: List[str], name: str) -> List[str]:
    """One method or constructor at class level, by name; 'fields' for the field block."""
    if name == "fields":
        return [ln[4:] for ln in lines
                if re.match(r"^    (private|public|protected) (.*;|enum .* \})$", ln)]
    for i, ln in enumerate(lines):
        if re.match(rf"^    (@Override|\S.*[ .]{re.escape(name)}\()", ln) and \
                (ln.startswith("    @") and name + "(" in lines[i + 1] or name + "(" in ln):
            j = i
            while lines[j] != "    }":
                j += 1
            return [x[4:] for x in lines[i:j + 1]]
    raise KeyError(name)


def _source(path: str) -> str:
    if path.startswith("starter:"):
        rel = "src/main/java/edu/sfsu/csc413/chess/" + path[len("starter:"):]
        return subprocess.run(["git", "-C", str(STARTER), "show", f"{STARTER_TAG}:{rel}"],
                              check=True, capture_output=True, text=True).stdout
    variant, file = path.split("/")
    return next((DEMO / variant).rglob(file)).read_text()


def _api(lines: List[str]) -> List[str]:
    """The type's header and its public signatures, bodies left out."""
    head = next(ln for ln in lines if ln.startswith("public "))
    sigs = [ln[4:].replace(" {", ";") for ln in lines
            if re.match(r"^    public .*\) \{$", ln)]
    return [head] + ["    " + s for s in sigs] + ["}"]


def java(spec: str) -> str:
    """'variant/File.java' or 'starter:dir/File.java', optionally '#a,b' for members or '#api'."""
    path, _, members = spec.partition("#")
    lines = _strip(_source(path))
    if not members:
        return "\n".join(lines)
    if members == "api":
        return "\n".join(_api(lines))
    parts = ["\n".join(_member(lines, m)) for m in members.split(",")]
    return "\n\n".join(parts)


def html_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def paste_code(html: str, notes: str) -> tuple:
    html = re.sub(r"(<!-- code:(\S+) -->).*?(<!-- /code -->)",
                  lambda m: f"{m.group(1)}<pre><code>{html_escape(java(m.group(2)))}</code></pre>{m.group(3)}",
                  html, flags=re.S)
    notes = re.sub(r"(<!-- java:(\S+) -->).*?(<!-- /java -->)",
                   lambda m: f"{m.group(1)}\n```java\n{java(m.group(2))}\n```\n{m.group(3)}",
                   notes, flags=re.S)
    return html, notes


DIAGRAMS = {"factory": factory, "factorymethod": factorymethod, "facade": facade, "command": command,
            "turnstile": turnstile, "stateclasses": stateclasses, "decorator": decorator, "wrapping": wrapping,
            "iowrap": iowrap, "mvc": mvc}


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
    html, text = paste_code(html, text)
    if html:
        slides.write_text(html)
    if text:
        notes.write_text(text)


if __name__ == "__main__":
    main()
