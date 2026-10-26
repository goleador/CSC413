"""Draw session 14's diagrams as inline SVG and paste them into slides.html.

The decks load nothing from a CDN, so Mermaid cannot render them in class.
Each diagram here is drawn from the same facts as its .mmd file next to this
script; the .mmd files are what students type. Run after editing either:

    python3 render.py

It replaces each region between <!-- svg:NAME --> and <!-- /svg:NAME --> in
../slides.html. Colours are the deck's CSS variables, so dark mode (D) works.
"""

from __future__ import annotations

import pathlib
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

FONT = 15
CW = FONT * 0.6          # monospace advance
LH = FONT * 1.45         # line height
PAD = 10
MONO = "ui-monospace, Menlo, Consolas, monospace"

STYLE = (
    f"font-family:{MONO};font-size:{FONT}px;"
    "fill:var(--slide-text);"
)

# Labels sit on top of lines; a halo in the background colour keeps them legible.
HALO = "paint-order:stroke;stroke:var(--slide-bg);stroke-width:6px;stroke-linejoin:round;"


def esc(text: str) -> str:
    """Escape text for SVG."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def defs() -> str:
    """Arrowheads for the six relationships, sized for FONT."""
    return """<defs>
  <marker id="open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M1,1 L11,6 L1,11" fill="none" stroke="var(--slide-text)" stroke-width="1.6"/></marker>
  <marker id="filled" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M1,1 L11,6 L1,11 z" fill="var(--slide-text)"/></marker>
  <marker id="triangle" viewBox="0 0 18 18" refX="17" refY="9" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M1,1 L17,9 L1,17 z" fill="var(--slide-bg)" stroke="var(--slide-text)" stroke-width="1.6"/></marker>
  <marker id="hollowdiamond" viewBox="0 0 24 14" refX="23" refY="7" markerWidth="24" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M1,7 L12,1 L23,7 L12,13 z" fill="var(--slide-bg)" stroke="var(--slide-text)" stroke-width="1.6"/></marker>
  <marker id="filleddiamond" viewBox="0 0 24 14" refX="23" refY="7" markerWidth="24" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
    <path d="M1,7 L12,1 L23,7 L12,13 z" fill="var(--slide-text)" stroke="var(--slide-text)" stroke-width="1.6"/></marker>
</defs>"""


# ----------------------------------------------------------------------
# Class diagrams
# ----------------------------------------------------------------------

@dataclass
class Box:
    """A class box: name, optional stereotype, fields, methods."""
    name: str
    x: float
    y: float
    stereotype: str = ""
    fields: List[str] = field(default_factory=list)
    methods: List[str] = field(default_factory=list)
    italic: bool = False
    min_w: float = 0
    min_h: float = 0

    def lines(self) -> List[str]:
        """Every text line, for width."""
        head = [self.name] + ([f"«{self.stereotype}»"] if self.stereotype else [])
        return head + self.fields + self.methods

    @property
    def w(self) -> float:
        longest = max(len(line.replace("$", "")) for line in self.lines())
        return max(self.min_w, longest * CW + 2 * PAD + 8)

    @property
    def h(self) -> float:
        head = 1 + (1 if self.stereotype else 0)
        h = head * LH + PAD
        if self.fields or self.methods:
            h += PAD / 2 + len(self.fields) * LH
            if self.fields:
                h += PAD / 2
        if self.methods:
            h += PAD / 2 + len(self.methods) * LH
        return max(self.min_h, h + PAD / 2)

    def anchor(self, side: str, frac: float = 0.5) -> Tuple[float, float]:
        """A point on one side: t, b, l, r; frac runs left→right or top→bottom."""
        if side == "t":
            return self.x + self.w * frac, self.y
        if side == "b":
            return self.x + self.w * frac, self.y + self.h
        if side == "l":
            return self.x, self.y + self.h * frac
        return self.x + self.w, self.y + self.h * frac

    def svg(self) -> str:
        out = [f'<rect x="{self.x:.1f}" y="{self.y:.1f}" width="{self.w:.1f}" height="{self.h:.1f}" '
               'rx="3" fill="var(--code-bg)" stroke="var(--slide-text)" stroke-width="1.6"/>']
        cx = self.x + self.w / 2
        y = self.y + PAD / 2 + LH * 0.8
        if not (self.fields or self.methods):
            head = 1 + (1 if self.stereotype else 0)
            y = self.y + (self.h - head * LH) / 2 + LH * 0.75
        if self.stereotype:
            out.append(f'<text x="{cx:.1f}" y="{y:.1f}" text-anchor="middle" '
                       f'style="fill:var(--slide-muted)">«{esc(self.stereotype)}»</text>')
            y += LH
        weight = "font-weight:700;" + ("font-style:italic;" if self.italic else "")
        out.append(f'<text x="{cx:.1f}" y="{y:.1f}" text-anchor="middle" style="{weight}">{esc(self.name)}</text>')
        y += PAD / 2 + LH * 0.2
        for group in (self.fields, self.methods):
            if not group:
                continue
            out.append(f'<line x1="{self.x:.1f}" y1="{y:.1f}" x2="{self.x + self.w:.1f}" y2="{y:.1f}" '
                       'stroke="var(--slide-text)" stroke-width="1.2"/>')
            y += PAD / 2
            for line in group:
                y += LH
                static = line.endswith("$")
                abstract = line.endswith("*")
                text = line.rstrip("$*")
                deco = ("text-decoration:underline;" if static else "") + \
                       ("font-style:italic;" if abstract else "")
                out.append(f'<text x="{self.x + PAD:.1f}" y="{y - LH * 0.25:.1f}" style="{deco}">{esc(text)}</text>')
            y += PAD / 2
        return "\n".join(out)


KIND = {
    #               dash   start marker       end marker
    "dependency":  (True,  None,              "open"),
    "association": (False, None,              "open"),
    "aggregation": (False, None,              "hollowdiamond"),
    "composition": (False, None,              "filleddiamond"),
    "inheritance": (False, None,              "triangle"),
    "realization": (True,  None,              "triangle"),
}


@dataclass
class Edge:
    """A relationship drawn from one box's side to another's.

    For aggregation and composition the diamond sits at the *start*, the
    whole; for every other kind the arrowhead sits at the *end*.
    """
    kind: str
    start: Tuple[str, str, float]
    end: Tuple[str, str, float]
    elbow: str = ""            # "" straight, "v" vertical-horizontal-vertical, "h" the reverse
    label: str = ""
    start_mult: str = ""
    end_mult: str = ""
    label_at: Tuple[float, float] = (0, 0)


def edge_svg(e: Edge, boxes: Dict[str, Box]) -> str:
    x1, y1 = boxes[e.start[0]].anchor(e.start[1], e.start[2])
    x2, y2 = boxes[e.end[0]].anchor(e.end[1], e.end[2])
    if e.elbow == "v":
        my = (y1 + y2) / 2
        pts = [(x1, y1), (x1, my), (x2, my), (x2, y2)]
    elif e.elbow == "h":
        mx = (x1 + x2) / 2
        pts = [(x1, y1), (mx, y1), (mx, y2), (x2, y2)]
    else:
        pts = [(x1, y1), (x2, y2)]
    dash, start, end = KIND[e.kind]
    if e.kind in ("aggregation", "composition"):
        pts = pts[::-1]          # drawn part → whole, so the diamond lands on the whole
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    attrs = 'fill="none" stroke="var(--slide-text)" stroke-width="1.6"'
    if dash:
        attrs += ' stroke-dasharray="7 5"'
    if start:
        attrs += f' marker-start="url(#{start})"'
    if end:
        attrs += f' marker-end="url(#{end})"'
    out = [f'<path d="{d}" {attrs}/>']
    if e.label:
        lx = (pts[0][0] + pts[-1][0]) / 2 + e.label_at[0]
        ly = (pts[0][1] + pts[-1][1]) / 2 + e.label_at[1]
        out.append(f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" '
                   f'style="fill:var(--slide-muted)">{esc(e.label)}</text>')
    ends = ((e.start_mult, pts[0], pts[1]), (e.end_mult, pts[-1], pts[-2]))
    if e.kind in ("aggregation", "composition"):
        ends = ((e.start_mult, pts[-1], pts[-2]), (e.end_mult, pts[0], pts[1]))
    for mult, (px, py), (qx, qy) in ends:
        if not mult:
            continue
        # beside the line, a little way along it
        dx, dy = qx - px, qy - py
        n = max((dx * dx + dy * dy) ** 0.5, 1)
        ox, oy = px + dx / n * 34, py + dy / n * 34
        if abs(dx) > abs(dy):
            ox, oy = ox - 10, oy - 8
        else:
            ox, oy = ox + 8, oy + 5
        out.append(f'<text x="{ox:.1f}" y="{oy:.1f}" style="{HALO}fill:var(--slide-muted)">{esc(mult)}</text>')
    return "\n".join(out)


def bus_svg(parent: Box, children: List[Box], gap: float = 34) -> str:
    """Inheritance drawn UML-style: children share one line up to one triangle."""
    px, py = parent.anchor("b")
    bus_y = min(c.y for c in children) - gap
    out = [f'<path d="M{px:.1f},{bus_y:.1f} L{px:.1f},{py:.1f}" fill="none" stroke="var(--slide-text)" '
           'stroke-width="1.6" marker-end="url(#triangle)"/>']
    xs = [c.anchor("t")[0] for c in children]
    out.append(f'<line x1="{min(xs + [px]):.1f}" y1="{bus_y:.1f}" x2="{max(xs + [px]):.1f}" y2="{bus_y:.1f}" '
               'stroke="var(--slide-text)" stroke-width="1.6"/>')
    for c in children:
        cx, cy = c.anchor("t")
        out.append(f'<line x1="{cx:.1f}" y1="{bus_y:.1f}" x2="{cx:.1f}" y2="{cy:.1f}" '
                   'stroke="var(--slide-text)" stroke-width="1.6"/>')
    return "\n".join(out)


def svg(width: float, height: float, body: str, label: str) -> str:
    return (f'<svg class="uml" viewBox="0 0 {width:.0f} {height:.0f}" role="img" aria-label="{esc(label)}" '
            f'style="{STYLE}" xmlns="http://www.w3.org/2000/svg">\n{defs()}\n{body}\n</svg>')


def class_diagram(boxes: List[Box], edges: List[Edge], extra: str, label: str,
                  margin: float = 30) -> str:
    by_name = {b.name: b for b in boxes}
    body = "\n".join([edge_svg(e, by_name) for e in edges] + [extra] + [b.svg() for b in boxes])
    width = max(b.x + b.w for b in boxes) + margin
    height = max(b.y + b.h for b in boxes) + margin
    return svg(width, height, body, label)


# ----------------------------------------------------------------------
# Sequence diagrams
# ----------------------------------------------------------------------

@dataclass
class Seq:
    """A sequence diagram built step by step."""
    names: List[str]
    gap: float = 250
    top: float = 20
    rows: List[str] = field(default_factory=list)
    y: float = 0
    frags: List[Tuple[str, str, float, float, float, List[float]]] = field(default_factory=list)
    open_frags: List[list] = field(default_factory=list)
    activations: Dict[str, List[float]] = field(default_factory=dict)
    spans: List[Tuple[str, float, float]] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.y = self.top + 2 * LH + 30

    def x(self, name: str) -> float:
        return 90 + self.names.index(name) * self.gap

    def activate(self, name: str) -> None:
        self.activations.setdefault(name, []).append(self.y - LH * 0.9)

    def deactivate(self, name: str) -> None:
        start = self.activations[name].pop()
        self.spans.append((name, start, self.y - LH * 0.6))

    def call(self, a: str, b: str, text: str, ret: bool = False) -> None:
        xa, xb = self.x(a), self.x(b)
        dash = ' stroke-dasharray="7 5"' if ret else ""
        mark = "open" if ret else "filled"
        sign = 1 if xb > xa else -1
        xa += sign * 6
        xb -= sign * 6
        self.rows.append(f'<text x="{(xa + xb) / 2:.1f}" y="{self.y - 7:.1f}" text-anchor="middle" style="{HALO}">{esc(text)}</text>')
        self.rows.append(f'<line x1="{xa:.1f}" y1="{self.y:.1f}" x2="{xb:.1f}" y2="{self.y:.1f}" '
                         f'stroke="var(--slide-text)" stroke-width="1.6"{dash} marker-end="url(#{mark})"/>')
        self.y += LH * 2

    def self_call(self, a: str, text: str) -> None:
        xa = self.x(a) + 6
        y = self.y - LH * 0.5
        self.rows.append(f'<text x="{xa + 44:.1f}" y="{y + LH * 0.55:.1f}" style="{HALO}">{esc(text)}</text>')
        self.rows.append(f'<path d="M{xa:.1f},{y - 6:.1f} L{xa + 34:.1f},{y - 6:.1f} L{xa + 34:.1f},{y + 14:.1f} '
                         f'L{xa + 2:.1f},{y + 14:.1f}" fill="none" stroke="var(--slide-text)" stroke-width="1.6" '
                         'marker-end="url(#filled)"/>')
        self.y += LH * 2

    def begin(self, kind: str, guard: str, left: str, right: str) -> None:
        self.open_frags.append([kind, guard, left, right, self.y - LH * 0.6, []])
        self.y += LH * 1.6

    def divider(self, guard: str) -> None:
        frag = self.open_frags[-1]
        frag[5].append((self.y - LH * 0.6, guard))
        self.y += LH * 1.3

    def end(self) -> None:
        kind, guard, left, right, top, dividers = self.open_frags.pop()
        x1 = self.x(left) - 70
        x2 = self.x(right) + 70
        bottom = self.y - LH * 0.7
        out = [f'<rect x="{x1:.1f}" y="{top:.1f}" width="{x2 - x1:.1f}" height="{bottom - top:.1f}" '
               'fill="none" stroke="var(--sfsu-gold)" stroke-width="1.8"/>',
               f'<path d="M{x1:.1f},{top + LH * 1.1:.1f} L{x1 + len(kind) * CW + 18:.1f},{top + LH * 1.1:.1f} '
               f'L{x1 + len(kind) * CW + 26:.1f},{top + LH * 0.6:.1f} L{x1 + len(kind) * CW + 26:.1f},{top:.1f}" '
               'fill="none" stroke="var(--sfsu-gold)" stroke-width="1.8"/>',
               f'<text x="{x1 + 6:.1f}" y="{top + LH * 0.8:.1f}" style="font-weight:700">{esc(kind)}</text>',
               f'<text x="{x1 + len(kind) * CW + 36:.1f}" y="{top + LH * 0.8:.1f}" '
               f'style="{HALO}fill:var(--slide-muted)">[{esc(guard)}]</text>']
        for dy, g in dividers:
            out.append(f'<line x1="{x1:.1f}" y1="{dy:.1f}" x2="{x2:.1f}" y2="{dy:.1f}" '
                       'stroke="var(--sfsu-gold)" stroke-width="1.4" stroke-dasharray="7 5"/>')
            out.append(f'<text x="{x1 + 6:.1f}" y="{dy + LH * 0.85:.1f}" style="fill:var(--slide-muted)">[{esc(g)}]</text>')
        self.rows = out + self.rows
        self.y += LH * 0.4

    def render(self, label: str) -> str:
        bottom = self.y + 10
        heads = []
        for n in self.names:
            x = self.x(n)
            w = len(n) * CW + 2 * PAD
            heads.append(f'<rect x="{x - w / 2:.1f}" y="{self.top:.1f}" width="{w:.1f}" height="{LH * 1.7:.1f}" '
                         'rx="3" fill="var(--code-bg)" stroke="var(--slide-text)" stroke-width="1.6"/>')
            heads.append(f'<text x="{x:.1f}" y="{self.top + LH * 1.15:.1f}" text-anchor="middle" '
                         f'style="font-weight:700">{esc(n)}</text>')
            heads.append(f'<line x1="{x:.1f}" y1="{self.top + LH * 1.7:.1f}" x2="{x:.1f}" y2="{bottom:.1f}" '
                         'stroke="var(--slide-muted)" stroke-width="1.2" stroke-dasharray="4 4"/>')
        bars = [f'<rect x="{self.x(n) - 6:.1f}" y="{a:.1f}" width="12" height="{b - a:.1f}" '
                'fill="var(--slide-bg)" stroke="var(--slide-text)" stroke-width="1.4"/>' for n, a, b in self.spans]
        width = 90 * 2 + (len(self.names) - 1) * self.gap
        return svg(width, bottom + 10, "\n".join(heads + bars + self.rows), label)


# ----------------------------------------------------------------------
# The diagrams
# ----------------------------------------------------------------------

def hook() -> str:
    game = Box("Game", 20, 20, fields=["-Board board", "-List<Move> history", "-Color sideToMove"],
               methods=["+legalMoves() List<Move>", "+play(Move) void"])
    mg = Box("MoveGenerator", 470, 20, methods=["-MoveGenerator()", "+legalMoves(Board, Color) List<Move>$",
                                                 "~pseudoLegalMoves(Board, Color) List<Move>$"])
    board = Box("Board", 20, 290, methods=["+pieceAt(Position) Piece", "+positionsOf(Color) List<Position>"])
    mg.y = 40
    edges = [Edge("composition", ("Game", "b", 0.5), ("Board", "t", 0.5)),
             Edge("dependency", ("Game", "r", 0.5), ("MoveGenerator", "l", 0.5)),
             Edge("dependency", ("MoveGenerator", "b", 0.5), ("Board", "r", 0.5), elbow="")]
    return class_diagram([game, mg, board], edges, "", "Game, MoveGenerator and Board as a class diagram")


def box() -> str:
    piece = Box("Piece", 20, 20, stereotype="abstract", italic=True,
                fields=["-Color color", "-PieceType type"],
                methods=["#Piece(Color, PieceType)", "+color() Color", "+type() PieceType",
                         "+pseudoLegalMoves(Board, Position) List<Move>*",
                         "+attacks(Board, Position, Position) boolean",
                         "#slidingMoves(Board, Position, int[][]) List<Move>",
                         "#steppingMoves(Board, Position, int[][]) List<Move>",
                         "+symbol() char"])
    return class_diagram([piece], [], "", "The Piece class as a UML box")


def arrows() -> str:
    rows = [("MoveGenerator", "Board", "dependency", "uses it, keeps nothing"),
            ("Move", "Position", "association", "holds a reference"),
            ("Board", "Piece", "aggregation", "holds parts that outlive it"),
            ("Game", "Board", "composition", "owns a part that dies with it"),
            ("Rook", "Piece", "inheritance", "is a kind of"),
            ("Board", "BoardView", "realization", "implements")]
    boxes: List[Box] = []
    edges: List[Edge] = []
    extra = []
    y = 20
    for i, (a, b, kind, says) in enumerate(rows):
        left = Box(a, 20, y, min_w=170, min_h=62)
        right = Box(b, 420, y, min_w=170, min_h=62, stereotype="interface" if b == "BoardView" else "")
        left.name = a + "​" * i          # unique keys; zero-width, invisible
        right.name = b + "​" * i
        boxes += [left, right]
        edges.append(Edge(kind, (left.name, "r", 0.5), (right.name, "l", 0.5)))
        mid = left.anchor("r")[1]
        extra.append(f'<text x="{640:.1f}" y="{mid + 5:.1f}" style="font-weight:700">{kind}</text>')
        extra.append(f'<text x="{790:.1f}" y="{mid + 5:.1f}" style="fill:var(--slide-muted)">{esc(says)}</text>')
        y += max(left.h, right.h) + 18
    d = class_diagram(boxes, edges, "\n".join(extra), "The six UML relationships, each drawn with engine classes")
    return _widen(d, 1090)


def _widen(svg_text: str, width: float) -> str:
    return re.sub(r'viewBox="0 0 \d+ ', f'viewBox="0 0 {width:.0f} ', svg_text, count=1)


def model() -> str:
    move = Box("Move", 24, 20, stereotype="record",
               fields=["+Position from", "+Position to", "+Piece moved", "+Piece captured", "+PieceType promotesTo"],
               methods=["+isCapture() boolean", "+isPromotion() boolean"])
    position = Box("Position", 24, 430, stereotype="record", fields=["+int file", "+int rank"],
                   methods=["+parse(String) Position$", "+isOnBoard(int, int) boolean$",
                            "+offsetOrNull(int, int) Position"])
    piece = Box("Piece", 390, 280, stereotype="abstract", italic=True,
                methods=["+color() Color", "+type() PieceType", "+pseudoLegalMoves(Board, Position) List<Move>*",
                         "+attacks(Board, Position, Position) boolean", "+symbol() char"])
    board = Box("Board", 400, 20, methods=["+pieceAt(Position) Piece", "+isEmpty(Position) boolean",
                                          "+place(Position, Piece) void", "+apply(Move) void", "+undo(Move) void",
                                          "+positionsOf(Color) List<Position>"])
    color = Box("Color", 1010, 20, stereotype="enumeration", fields=["WHITE", "BLACK"],
                methods=["+opposite() Color", "+pawnDirection() int", "+pawnStartRank() int", "+promotionRank() int"])
    ptype = Box("PieceType", 1010, 320, stereotype="enumeration",
                fields=["PAWN, KNIGHT, BISHOP,", "ROOK, QUEEN, KING"],
                methods=["+symbol() char", "+fromSymbol(char) PieceType$"])
    kids = [Box(n, 400 + i * 112, 580, min_w=100) for i, n in enumerate(["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"])]
    edges = [Edge("aggregation", ("Board", "b", 0.5), ("Piece", "t", 0.43), end_mult="0..64"),
             Edge("association", ("Move", "b", 0.3), ("Position", "t", 0.215), end_mult="2"),
             Edge("association", ("Move", "r", 0.75), ("Piece", "l", 0.3), elbow="h", end_mult="1..2"),
             Edge("association", ("Piece", "r", 0.25), ("Color", "l", 0.5), elbow="h"),
             Edge("association", ("Piece", "r", 0.6), ("PieceType", "l", 0.5), elbow="h")]
    # Move → PieceType goes round the left of Position and under the subclasses.
    mx, my = move.anchor("l", 0.85)
    tx, ty = ptype.anchor("b", 0.5)
    low = max(k.y + k.h for k in kids + [position]) + 24
    extra = [bus_svg(piece, kids),
             f'<path d="M{mx:.1f},{my:.1f} L6,{my:.1f} L6,{low:.1f} L{tx:.1f},{low:.1f} L{tx:.1f},{ty:.1f}" '
             'fill="none" stroke="var(--slide-text)" stroke-width="1.6" marker-end="url(#open)"/>',
             f'<text x="{tx + 8:.1f}" y="{ty + 30:.1f}" style="fill:var(--slide-muted)">0..1</text>']
    return class_diagram([move, position, piece, board, color, ptype] + kids, edges, "\n".join(extra),
                         "Class diagram of the model package", margin=40)


def play() -> str:
    s = Seq(["caller", "Game", "Board"], gap=340)
    s.call("caller", "Game", "play(move)")
    s.activate("Game")
    s.self_call("Game", "legalMoves()")
    s.begin("alt", "move not in legalMoves()", "caller", "Board")
    s.call("Game", "caller", "throw IllegalArgumentException", ret=True)
    s.divider("else")
    s.call("Game", "Board", "apply(move)")
    s.self_call("Game", "history.add(move)")
    s.self_call("Game", "sideToMove = sideToMove.opposite()")
    s.call("Game", "caller", "return", ret=True)
    s.end()
    s.deactivate("Game")
    return s.render("Sequence diagram of Game.play")


def legal_m4() -> str:
    s = Seq(["caller", "Game", "MoveGenerator", "Board", "Piece"], gap=235)
    s.call("caller", "Game", "legalMoves()")
    s.activate("Game")
    s.call("Game", "MoveGenerator", "legalMoves(board, sideToMove)")
    s.activate("MoveGenerator")
    s.self_call("MoveGenerator", "pseudoLegalMoves(board, color)")
    s.call("MoveGenerator", "Board", "positionsOf(color)")
    s.call("Board", "MoveGenerator", "squares", ret=True)
    s.begin("loop", "each square from", "MoveGenerator", "Piece")
    s.call("MoveGenerator", "Board", "pieceAt(from)")
    s.call("Board", "MoveGenerator", "piece", ret=True)
    s.call("MoveGenerator", "Piece", "pseudoLegalMoves(board, from)")
    s.call("Piece", "MoveGenerator", "moves", ret=True)
    s.end()
    s.call("MoveGenerator", "Game", "moves", ret=True)
    s.deactivate("MoveGenerator")
    s.call("Game", "caller", "moves", ret=True)
    s.deactivate("Game")
    return s.render("Sequence diagram of Game.legalMoves as of M4")


def packages() -> str:
    nodes = {"Main": (330, 20), "view": (60, 170), "engine": (600, 170), "model": (330, 320), "factory": (600, 320)}
    w, h = 150, 56
    out = []
    for n, (x, y) in nodes.items():
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="var(--code-bg)" '
                   'stroke="var(--slide-text)" stroke-width="1.6"/>')
        out.append(f'<text x="{x + w / 2}" y="{y + h / 2 + 5}" text-anchor="middle" style="font-weight:700">{n}</text>')

    def arrow(a: str, b: str) -> None:
        (ax, ay), (bx, by) = nodes[a], nodes[b]
        acx, acy, bcx, bcy = ax + w / 2, ay + h / 2, bx + w / 2, by + h / 2
        # clip both ends to the rectangles' borders
        def clip(cx: float, cy: float, dx: float, dy: float) -> Tuple[float, float]:
            tx = (w / 2) / abs(dx) if dx else 1e9
            ty = (h / 2) / abs(dy) if dy else 1e9
            t = min(tx, ty)
            return cx + dx * t, cy + dy * t
        dx, dy = bcx - acx, bcy - acy
        sx, sy = clip(acx, acy, dx, dy)
        ex, ey = clip(bcx, bcy, -dx, -dy)
        out.append(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="var(--slide-text)" '
                   'stroke-width="1.6" stroke-dasharray="7 5" marker-end="url(#open)"/>')

    for a, b in [("Main", "view"), ("Main", "engine"), ("Main", "model"), ("view", "model"),
                 ("engine", "model"), ("engine", "factory"), ("factory", "model")]:
        arrow(a, b)
    return svg(800, 400, "\n".join(out), "Package diagram: every arrow points toward model")


def turn() -> str:
    out = []
    states = {"WhiteToMove": (260, 60), "BlackToMove": (660, 60)}
    w, h = 190, 60
    out.append('<circle cx="60" cy="90" r="11" fill="var(--slide-text)"/>')
    out.append(f'<line x1="72" y1="90" x2="{260 - 4}" y2="90" stroke="var(--slide-text)" stroke-width="1.6" '
               'marker-end="url(#open)"/>')
    out.append('<text x="160" y="80" text-anchor="middle" style="fill:var(--slide-muted)">new Game()</text>')
    for n, (x, y) in states.items():
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="22" fill="var(--code-bg)" '
                   'stroke="var(--slide-text)" stroke-width="1.6"/>')
        out.append(f'<text x="{x + w / 2}" y="{y + h / 2 + 5}" text-anchor="middle" style="font-weight:700">{n}</text>')
    wx, bx = 260 + w, 660
    out.append(f'<path d="M{wx - 30},{60} C{wx + 40},{-10} {bx - 40},{-10} {bx + 30},{60}" fill="none" '
               'stroke="var(--slide-text)" stroke-width="1.6" marker-end="url(#open)"/>')
    out.append(f'<text x="{(wx + bx) / 2}" y="40" text-anchor="middle">play(move)</text>')
    out.append(f'<path d="M{bx + 30},{120} C{bx - 40},{190} {wx + 40},{190} {wx - 30},{120}" fill="none" '
               'stroke="var(--slide-text)" stroke-width="1.6" marker-end="url(#open)"/>')
    out.append(f'<text x="{(wx + bx) / 2}" y="152" text-anchor="middle">play(move)</text>')
    out.append(f'<line x1="{wx}" y1="80" x2="{bx - 2}" y2="80" stroke="var(--slide-text)" stroke-width="1.6" '
               'marker-end="url(#open)"/>')
    out.append(f'<line x1="{bx}" y1="100" x2="{wx + 2}" y2="100" stroke="var(--slide-text)" stroke-width="1.6" '
               'marker-end="url(#open)"/>')
    out.append(f'<text x="{(wx + bx) / 2}" y="74" text-anchor="middle" style="fill:var(--slide-muted)">undoLastMove()</text>')
    out.append(f'<text x="{(wx + bx) / 2}" y="118" text-anchor="middle" style="fill:var(--slide-muted)">undoLastMove()</text>')
    return svg(900, 210, "\n".join(out), "State diagram of whose turn it is")


DIAGRAMS = {"hook": hook, "box": box, "arrows": arrows, "model": model, "play": play,
            "legalmoves-m4": legal_m4, "packages": packages, "turn": turn}


def main() -> None:
    here = pathlib.Path(__file__).resolve().parent
    out_dir = here / "svg"
    out_dir.mkdir(exist_ok=True)
    slides = here.parent / "slides.html"
    html = slides.read_text() if slides.exists() else ""
    for name, make in DIAGRAMS.items():
        # Marker ids must be unique per page: a url(#id) that resolves into a
        # hidden slide draws nothing.
        drawing = make().replace('id="', f'id="{name}-').replace("url(#", f"url(#{name}-")
        (out_dir / f"{name}.svg").write_text(drawing.replace(
            'style="', 'style="--slide-text:#1a1a1a;--slide-muted:#5a5a68;--code-bg:#f4f4f8;'
            '--slide-bg:#fff;--sfsu-gold:#c99700;background:#fff;', 1))
        pattern = re.compile(rf"(<!-- svg:{re.escape(name)} -->).*?(<!-- /svg:{re.escape(name)} -->)", re.S)
        html = pattern.sub(lambda m: f"{m.group(1)}\n{drawing}\n{m.group(2)}", html)
    if html:
        slides.write_text(html)

    # The notes quote each diagram's Mermaid source verbatim.
    notes = here.parent / "notes.md"
    text = notes.read_text()
    for source in sorted(here.glob("*.mmd")):
        name = source.stem
        block = "```mermaid\n" + source.read_text().rstrip() + "\n```"
        pattern = re.compile(rf"(<!-- mmd:{re.escape(name)} -->).*?(<!-- /mmd:{re.escape(name)} -->)", re.S)
        text = pattern.sub(lambda m: f"{m.group(1)}\n{block}\n{m.group(2)}", text)
    notes.write_text(text)


if __name__ == "__main__":
    main()
