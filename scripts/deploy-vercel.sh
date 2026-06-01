#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROD=false

usage() {
	echo "Usage: $(basename "$0") [--prod]"
	echo ""
	echo "  (default)  Preview deployment"
	echo "  --prod     Production deployment"
	echo ""
	echo "First time:"
	echo "  1. npm i -g vercel   (or: pnpm add -g vercel)"
	echo "  2. vercel login"
	echo "  3. vercel link       (in project root)"
	exit 1
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--prod)
			PROD=true
			shift
			;;
		-h | --help)
			usage
			;;
		*)
			echo "Unknown option: $1"
			usage
			;;
	esac
done

if command -v vercel >/dev/null 2>&1; then
	VERCEL_BIN="vercel"
elif command -v pnpm >/dev/null 2>&1; then
	VERCEL_BIN="pnpm exec vercel"
elif command -v npx >/dev/null 2>&1; then
	VERCEL_BIN="npx vercel@latest"
else
	echo "Error: Vercel CLI not found. Install with: npm i -g vercel"
	exit 1
fi

run() {
	if [[ "$VERCEL_BIN" == "pnpm exec vercel" ]]; then
		pnpm exec vercel "$@"
	else
		$VERCEL_BIN "$@"
	fi
}

if command -v pnpm >/dev/null 2>&1; then
	PM="pnpm"
else
	PM="npm"
fi

echo "→ Running checks..."
$PM run check

echo "→ Building for Vercel..."
$PM run build

if [[ ! -d "$ROOT/.vercel/output" ]]; then
	echo "Error: .vercel/output not found. Is @sveltejs/adapter-vercel configured?"
	exit 1
fi

if $PROD; then
	echo "→ Deploying to production..."
	run deploy --prebuilt --prod
else
	echo "→ Deploying preview..."
	run deploy --prebuilt
fi
