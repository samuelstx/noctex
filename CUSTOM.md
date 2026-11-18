# Noctex — cambios respecto a Overleaf CE+

Noctex es un fork de [Overleaf Extended CE](https://github.com/yu-i-i/overleaf-cep)
(a su vez fork de [overleaf/overleaf](https://github.com/overleaf/overleaf)),
publicado bajo AGPL-3.0 en <https://github.com/samuelstx/noctex>.

**Regla de oro:** tocar lo mínimo del código original. Todo lo nuevo vive en
archivos propios (`noctex/`, `noctex-*`); en los archivos de upstream solo se
añaden líneas de importación o valores por defecto, marcados con `Noctex`.
Para localizar todos los puntos de contacto:

```bash
git diff cep/ext-ce...custom --stat
grep -rn "Noctex" services/web --include=*.scss --include=*.mjs --include=*.ts
```

## Ramas y remotos

| Remoto     | Repositorio                 | Uso                                  |
|------------|-----------------------------|--------------------------------------|
| `origin`   | samuelstx/noctex            | tu fork (rama de trabajo: `custom`)  |
| `cep`      | yu-i-i/overleaf-cep         | base CE+ (rama `ext-ce`)             |
| `overleaf` | overleaf/overleaf           | upstream oficial (solo consulta)     |

Incorporar una versión nueva de CE+:

```bash
git fetch cep --tags
git switch custom
git merge cep/ext-ce          # o la etiqueta, p. ej. v6.3.3-ext-v5.2
# resolver conflictos (solo deberían aparecer en las líneas listadas abajo)
```

## Cambios

### 1. Paleta «Lavanda» (pastel sobre negro + modo claro pastel)

| Archivo | Tipo | Qué hace |
|---|---|---|
| `services/web/frontend/stylesheets/noctex/_palette.scss` | nuevo | Redefine rampas (neutros lavanda, verde→lila, azul, rojo, amarillo, menta) y tokens semánticos, tanto en Sass como en `:root` |
| `services/web/frontend/stylesheets/foundations/all.scss` | +1 línea | Importa la paleta justo después de `colors` |
| `services/web/frontend/stylesheets/noctex/_overrides.scss` | nuevo | Ajustes de componentes: texto oscuro sobre botones pastel, bordes de botones |
| `services/web/frontend/stylesheets/main-style.scss` | +2 líneas | Importa los ajustes al final |

| `services/web/frontend/stylesheets/noctex/_dark-pages.scss` | nuevo | En modo oscuro, redirige en `<html>` los tokens claros y los de Bootstrap a los oscuros (login, ajustes, administración…); campos, tarjetas y títulos; logotipo de cabecera según el tema |
| `services/web/app/views/layout-base.pug` | +4 líneas | Mini-script al abrir `<body>`: aplica el último tema activo (oscuro por defecto) en las páginas renderizadas en servidor |
| `services/web/frontend/js/shared/hooks/use-themed-page.tsx` | +5 líneas | Guarda el tema activo en `localStorage['noctex-theme']` |

En `_overrides.scss` también: selección en modo oscuro con tinte lavanda
translúcido (árbol de archivos, índice, menús, historial, paleta de comandos,
panel de proyectos) y la cabecera de administración de CE+ en rosa pastel.

El verde de marca de Overleaf se sustituye **conservando el nombre** de la rampa
(`--green-*` ahora es lila) para que los ~40 componentes que lo usan
directamente cambien sin tocarlos.

Contraste verificado con WCAG 2.x (texto ≥ 4.5:1, bordes ≥ 3:1):

| Token | Claro | Oscuro |
|---|---|---|
| Texto principal | `#0b0b10` · 15.4:1 | `#eceaf4` · 13.5:1 |
| Texto secundario | `#45425a` · 7.6:1 | `#b9b6c8` · 8.1:1 |
| Placeholder | `#625e74` · 4.9:1 | `#8b879c` · 4.6:1 |
| Enlace | `#6849d0` · 4.8:1 | `#c4b5fd` · 8.7:1 |
| Peligro / aviso / éxito / info | 4.8 / 4.6 / 4.9 / 4.8 | 8.6 / 12.5 / 11.1 / 9.4 |
| Botón pastel (tinta `#0b0b10`) | ≥ 10.4:1 | ≥ 10.4:1 |

(En el peor fondo de cada tema: `#e5e2ef` en claro, `#20202b` en oscuro.)

### 2. Temas del editor

| Archivo | Tipo | Qué hace |
|---|---|---|
| `services/web/frontend/js/features/source-editor/themes/cm6/noctex.json` | nuevo | Tema oscuro (resaltado ≥ 5.2:1 sobre la línea activa) |
| `services/web/frontend/js/features/source-editor/themes/cm6/noctex_light.json` | nuevo | Tema claro (≥ 5.3:1) |
| `services/web/app/src/Features/Project/ProjectController.mjs` | +2 líneas | Añade ambos a `THEME_LIST` |
| `services/web/app/src/models/User.mjs` | 3 valores | Por defecto para usuarios nuevos: `noctex` / `noctex_light` |

### 3. Marca

| Archivo | Tipo | Qué hace |
|---|---|---|
| `noctex-brand/make-brand.sh` | nuevo | Genera logotipos y favicons (rsvg-convert + ImageMagick) |
| `services/web/public/noctex-logo-{dark,light}.svg` | nuevo | Logotipo para cabecera |
| `services/web/public/favicon*.{svg,png,ico}`, `apple-touch-icon.png`, `mask-favicon.svg` | sustituidos | Favicons Noctex (normal, compilando, compilado, error) |
| `services/web/public/img/ol-brand/*` | sustituidos | Logotipos de Overleaf reemplazados por Noctex con mismos nombres y proporciones (barra del editor, carga, cabecera, correos, imagen social) |

El nombre, el logotipo y el pie (con el enlace al código fuente que exige la
AGPL) se configuran por variables de entorno en el despliegue:
`OVERLEAF_APP_NAME`, `OVERLEAF_NAV_TITLE`, `OVERLEAF_HEADER_IMAGE_URL_LIGHT`,
`OVERLEAF_HEADER_IMAGE_URL_DARK`, `OVERLEAF_RIGHT_FOOTER`.

### 4. Editor en móvil (< 768 px)

| Archivo | Tipo | Qué hace |
|---|---|---|
| `services/web/frontend/js/features/ide-react/components/noctex/mobile-editor-bar.tsx` | nuevo | Barra inferior Archivos · Código · PDF · Más; fuerza la disposición «flat» en móvil y la restaura al volver a escritorio; PDF compila si hay cambios; textos propios en español/inglés |
| `services/web/frontend/stylesheets/noctex/_mobile.scss` | nuevo | Barra superior compacta, panel lateral como cajón superpuesto, botones de 48 px, código a 16 px (evita el zoom de iOS) |
| `services/web/frontend/js/features/ide-react/components/layout/main-layout.tsx` | +2 líneas | Monta la barra |
| `services/web/app/src/Features/Project/ProjectController.mjs` | 1 valor | `metadata.viewport: true` en el editor (Overleaf la desactivaba y el móvil pintaba el escritorio a escala) |

Probado en 360×800 (Galaxy S), 375×667 (iPhone SE), 390×844 (iPhone 15) y
412×915 (Pixel): sin desbordamiento horizontal; en 1280×800 el editor sigue
igual que en Overleaf.

### 5. Entorno de pruebas local

`noctex-dev/compose.yaml`: Noctex + MongoDB 8 + Redis 7.4 en `127.0.0.1:8080`.

## Configuración obligatoria en producción

- `OVERLEAF_ENABLE_REGISTRATION_PAGE=false` — **CE+ activa el registro público
  por defecto** si no hay LDAP/SAML/OIDC. En Noctex solo se entra por invitación.
- `OVERLEAF_INVITE_TOKEN_SECRET` (≥ 16 caracteres, desde 6.2.0).
