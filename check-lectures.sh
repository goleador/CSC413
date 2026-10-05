#!/usr/bin/env bash
# Pre-push checks for lecture material. See lectures/README.md, "Lecture authoring rules".
# Exits non-zero if any check finds something.
set -u
cd "$(dirname "$0")"
status=0

echo "== boilerplate speaker notes (must be empty)"
rg -n "The written notes develop this example" lectures/ && status=1

echo "== milestone solution bodies in lectures/ and weeks/ (must be empty)"
rg -n "findLegalMove\(String notation\) \{|static List<Move> pseudoLegalMoves|MoveGenerator.legalMoves\(board, sideToMove\)" lectures/ weeks/ && status=1

echo "== instructor-only files linked from the public site (must be empty)"
rg -n "INSTRUCTOR-ONLY\.md" index.html weeks/ --glob '*.html' && status=1


[ $status -eq 0 ] && echo "all checks passed" || echo "CHECKS FAILED"
exit $status
