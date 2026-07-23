#!/usr/bin/env bash
# Reads the Cloudinary API secret from the clipboard, verifies it against
# Cloudinary using a real signed request, and only then stores it in the
# Cloudflare Worker. The secret is never printed.
set -euo pipefail
export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH

CLOUD=fnx7rpyi
KEY=838715368248696

SECRET=$(pbpaste | tr -d '[:space:]')
LEN=${#SECRET}
if [ "$LEN" -lt 20 ] || [ "$LEN" -gt 40 ]; then
  echo "The clipboard doesn't look like an API secret (length $LEN)."
  echo "Copy the API Secret from the 'secret' row on the Cloudinary API Keys page, then run me again."
  exit 1
fi
case "$SECRET" in
  *[!A-Za-z0-9_-]*) echo "Clipboard has unexpected characters. Copy just the secret and rerun."; exit 1 ;;
esac

echo "Testing the key/secret pair against Cloudinary..."
TS=$(date +%s)
SIG=$(printf 'timestamp=%s%s' "$TS" "$SECRET" | openssl dgst -sha1 -hex | awk '{print $NF}')
TMPIMG=$(mktemp /tmp/cldtest-XXXX.gif)
printf 'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b' > "$TMPIMG"
RESP=$(curl -s --max-time 20 -X POST "https://api.cloudinary.com/v1_1/$CLOUD/image/upload" \
  -F "file=@$TMPIMG" -F "api_key=$KEY" -F "timestamp=$TS" -F "signature=$SIG")
rm -f "$TMPIMG"

if echo "$RESP" | grep -q '"public_id"'; then
  echo "Pair is VALID. Storing it in the Worker..."
  cd "$HOME/ogeneo"
  printf '%s' "$SECRET" | npx wrangler secret put CLOUDINARY_API_SECRET
  echo "Done. The upload pipeline should be fully armed."
else
  echo "Cloudinary rejected this pair. Response was:"
  echo "$RESP" | head -3
  echo "Make sure you copied the API Secret from the SAME row as key $KEY (the row named 'secret')."
  exit 1
fi
