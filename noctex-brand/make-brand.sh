#!/usr/bin/env bash
# Genera los logotipos y favicons de Noctex en services/web/public/.
# Requiere: rsvg-convert y magick (ImageMagick). Uso: bash noctex-brand/make-brand.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=services/web/public

# Trazado común (viewBox 0 0 124 32): luna creciente + estrella + «noctex» monolínea
wordmark() { # $1 color luna, $2 color texto, $3 color estrella
cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="124" height="32" viewBox="0 0 124 32" role="img" aria-label="Noctex">
  <defs><mask id="m"><rect width="32" height="32" fill="#fff"/><circle cx="18.5" cy="11.5" r="9" fill="#000"/></mask></defs>
  <circle cx="13" cy="16.5" r="11" fill="$1" mask="url(#m)"/>
  <circle cx="24.5" cy="6" r="1.7" fill="$3"/>
  <g fill="none" stroke="$2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 11V25M34 15.5a4.5 4.5 0 0 1 9 0V25"/>
    <circle cx="53" cy="18" r="7"/>
    <path d="M74.5 12.6A7 7 0 1 0 74.5 23.4"/>
    <path d="M82 6V21.5a3.5 3.5 0 0 0 3.5 3.5H87M78.5 11H87"/>
    <path d="M90 18H104A7 7 0 1 0 101.95 22.95"/>
    <path d="M108 11L120 25M120 11L108 25"/>
  </g>
</svg>
EOF
}

mark() { # $1 fondo, $2 color luna, $3 color estrella  (favicon 16x16)
cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <defs><mask id="m"><rect width="16" height="16" fill="#fff"/><circle cx="10.2" cy="5.6" r="4.6" fill="#000"/></mask></defs>
  <circle cx="8" cy="8" r="8" fill="$1"/>
  <circle cx="7.2" cy="8.6" r="5.2" fill="$2" mask="url(#m)"/>
  <circle cx="12.3" cy="3.7" r="1" fill="$3"/>
</svg>
EOF
}

INK=#0b0b10; LILAC=#c4b5fd; LILAC_DEEP=#7c5ce0; TEXT_DARK=#eceaf4; SKY=#9cc9ff
wordmark "$LILAC" "$TEXT_DARK" "$SKY"     > "$OUT/noctex-logo-dark.svg"   # para fondo oscuro
wordmark "$LILAC_DEEP" "$INK" "#3560ac"   > "$OUT/noctex-logo-light.svg"  # para fondo claro

mark "$INK" "$LILAC" "$SKY"     > "$OUT/favicon.svg"
mark "$INK" "#ffe08a" "$SKY"    > "$OUT/favicon-compiling.svg"
mark "$INK" "#9de5c3" "$SKY"    > "$OUT/favicon-compiled.svg"
mark "$INK" "#ffa3b5" "$SKY"    > "$OUT/favicon-error.svg"
# Safari pinned tab: monocromo
mark "#000" "#fff" "#fff" | sed 's/fill="#000"/fill="none"/' > "$OUT/mask-favicon.svg"

# --- Sustitución de los logotipos de Overleaf (mismos nombres y proporciones) ---
# Así cambian la barra del editor, la pantalla de carga, la cabecera, el pie y
# los correos sin tocar código.
BRAND="$OUT/img/ol-brand"

o_mark() { # viewBox 136x157 como el original; $1 luna, $2 estrella
cat <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="136" height="157" viewBox="0 0 136 157" role="img" aria-label="Noctex">
  <defs><mask id="m"><rect width="136" height="157" fill="#fff"/><circle cx="94" cy="58" r="46" fill="#000"/></mask></defs>
  <circle cx="64" cy="88" r="58" fill="$1" mask="url(#m)"/>
  <circle cx="118" cy="24" r="9" fill="$2"/>
</svg>
EOF
}

wordmark_box() { # $1 luna, $2 texto, $3 estrella, $4 viewBox, $5 ancho, $6 alto
  wordmark "$1" "$2" "$3" | sed -e "s|width=\"124\" height=\"32\" viewBox=\"0 0 124 32\"|width=\"$5\" height=\"$6\" viewBox=\"$4\"|"
}

o_mark "$LILAC" "$SKY"           > "$BRAND/overleaf-o-white.svg"  # sobre fondo oscuro
o_mark "$LILAC_DEEP" "#3560ac"   > "$BRAND/overleaf-o-dark.svg"   # sobre fondo claro
o_mark "$LILAC_DEEP" "#3560ac"   > "$BRAND/overleaf-o.svg"
o_mark "#8b879c" "#8b879c"       > "$BRAND/overleaf-o-grey.svg"
wordmark_box "$LILAC_DEEP" "$INK" "#3560ac" "0 -2 124 36"   542 157 > "$BRAND/overleaf.svg"
wordmark_box "$LILAC" "$TEXT_DARK" "$SKY"   "0 -2 124 36"   542 157 > "$BRAND/overleaf-white.svg"
wordmark_box "$INK" "$INK" "$INK"           "0 -2.6 124 36.5" 129 38 > "$BRAND/overleaf-black.svg"
wordmark_box "$LILAC_DEEP" "$INK" "#3560ac" "0 -3.1 124 38.2" 130 40 > "$BRAND/overleaf-green.svg"

# PNG derivados (correo, redes sociales)
rsvg-convert -w 277 -h 80 -a "$BRAND/overleaf.svg" | magick - -background white -gravity center -extent 277x80 "$BRAND/email-logo@2x.png"
rsvg-convert -w 330 "$BRAND/overleaf-white.svg" | magick - -background "$INK" -gravity center -extent 410x180 "$BRAND/logo-horizontal.png"
rsvg-convert -w 170 -h 196 "$BRAND/overleaf-o-white.svg" | magick - -background "$INK" -gravity center -extent 256x256 "$BRAND/overleaf_og_logo.png"

rsvg-convert -w 16  -h 16  "$OUT/favicon.svg" -o "$OUT/favicon-16x16.png"
rsvg-convert -w 32  -h 32  "$OUT/favicon.svg" -o "$OUT/favicon-32x32.png"
rsvg-convert -w 180 -h 180 "$OUT/favicon.svg" -o "$OUT/apple-touch-icon.png"
rsvg-convert -w 48  -h 48  "$OUT/favicon.svg" -o /tmp/noctex-fav48.png
magick "$OUT/favicon-16x16.png" "$OUT/favicon-32x32.png" /tmp/noctex-fav48.png "$OUT/favicon.ico"
rm -f /tmp/noctex-fav48.png
echo "Marca Noctex generada en $OUT"
