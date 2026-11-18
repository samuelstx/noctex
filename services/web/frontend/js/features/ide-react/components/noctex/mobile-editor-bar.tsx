/**
 * Noctex · barra inferior del editor en móvil (< 768 px).
 *
 * En pantallas estrechas el editor y el PDF no caben lado a lado: se fuerza la
 * disposición «flat» (uno u otro a pantalla completa) y esta barra permite
 * cambiar entre Archivos (cajón lateral), Código, PDF (compila si hay cambios)
 * y Más (búsqueda, chat, revisión, historial). Al volver a escritorio se
 * restaura la disposición lado a lado si la forzamos nosotros.
 * Estilos en stylesheets/noctex/_mobile.scss.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import MaterialIcon from '@/shared/components/material-icon'
import getMeta from '@/utils/meta'
import { useLayoutContext } from '@/shared/context/layout-context'
import {
  RailTabKey,
  useRailContext,
} from '@/features/ide-react/context/rail-context'
import { useDetachCompileContext as useCompileContext } from '@/shared/context/detach-compile-context'

export const NOCTEX_MOBILE_QUERY = '(max-width: 767.98px)'

const LABELS = {
  es: {
    bar: 'Navegación del editor',
    files: 'Archivos',
    code: 'Código',
    pdf: 'PDF',
    compiling: 'Compilando…',
    more: 'Más',
    search: 'Buscar en el proyecto',
    chat: 'Chat',
    review: 'Comentarios y cambios',
    history: 'Historial',
    closePanel: 'Cerrar panel',
  },
  en: {
    bar: 'Editor navigation',
    files: 'Files',
    code: 'Code',
    pdf: 'PDF',
    compiling: 'Compiling…',
    more: 'More',
    search: 'Search project',
    chat: 'Chat',
    review: 'Comments and changes',
    history: 'History',
    closePanel: 'Close panel',
  },
}

function useLabels() {
  const lang = getMeta('ol-i18n')?.currentLangCode
  return lang?.startsWith('es') ? LABELS.es : LABELS.en
}

const FORCED_FLAT_KEY = 'noctex-mobile-forced-flat'

function readForcedFlat() {
  try {
    return localStorage.getItem(FORCED_FLAT_KEY) === '1'
  } catch {
    return false
  }
}

function writeForcedFlat(value: boolean) {
  try {
    if (value) localStorage.setItem(FORCED_FLAT_KEY, '1')
    else localStorage.removeItem(FORCED_FLAT_KEY)
  } catch {}
}

export function useIsNoctexMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia?.(NOCTEX_MOBILE_QUERY).matches ?? false
  )
  useEffect(() => {
    const mql = window.matchMedia?.(NOCTEX_MOBILE_QUERY)
    if (!mql) return
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

type TabProps = {
  icon: string
  label: string
  active?: boolean
  badge?: boolean
  onClick: () => void
  expanded?: boolean
}

function BarButton({ icon, label, active, badge, onClick, expanded }: TabProps) {
  return (
    <button
      type="button"
      className={classNames('noctex-mobile-bar-button', { active })}
      aria-pressed={expanded === undefined ? active : undefined}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <span className="noctex-mobile-bar-icon">
        <MaterialIcon type={icon} />
        {badge && <span className="noctex-mobile-bar-badge" aria-hidden />}
      </span>
      <span className="noctex-mobile-bar-label">{label}</span>
    </button>
  )
}

export default function MobileEditorBar() {
  const isMobile = useIsNoctexMobile()
  const labels = useLabels()
  const { view, setView, pdfLayout, changeLayout } = useLayoutContext()
  const {
    isOpen: railIsOpen,
    setIsOpen: setRailIsOpen,
    selectedTab,
    openTab,
  } = useRailContext()
  const { startCompile, uncompiled, compiling } = useCompileContext()
  const [moreOpen, setMoreOpen] = useState(false)
  // Se recuerda entre recargas: Overleaf guarda la disposición en localStorage
  const forcedFlat = useRef(readForcedFlat())

  // Código o PDF a pantalla completa en móvil; se deshace al volver a escritorio
  useEffect(() => {
    if (isMobile && pdfLayout !== 'flat') {
      forcedFlat.current = true
      writeForcedFlat(true)
      changeLayout('flat', 'editor')
    } else if (!isMobile && forcedFlat.current && pdfLayout === 'flat') {
      // El panel del PDF restaura su estado plegado tras el primer render, así
      // que la marca se conserva hasta ver «flat» en escritorio
      forcedFlat.current = false
      writeForcedFlat(false)
      changeLayout('sideBySide')
    }
  }, [isMobile, pdfLayout, changeLayout])

  // Al entrar en móvil, el cajón lateral empieza cerrado
  useEffect(() => {
    if (isMobile) setRailIsOpen(false)
  }, [isMobile, setRailIsOpen])

  // Las clases en <body> activan los estilos móviles solo en el editor
  useEffect(() => {
    document.body.classList.toggle('noctex-mobile-editor', isMobile)
    return () => document.body.classList.remove('noctex-mobile-editor')
  }, [isMobile])
  useEffect(() => {
    document.body.classList.toggle('noctex-rail-open', isMobile && railIsOpen)
    return () => document.body.classList.remove('noctex-rail-open')
  }, [isMobile, railIsOpen])

  const showFiles = useCallback(() => {
    setMoreOpen(false)
    if (railIsOpen && selectedTab === 'file-tree') {
      setRailIsOpen(false)
    } else {
      openTab('file-tree')
    }
  }, [railIsOpen, selectedTab, setRailIsOpen, openTab])

  const showCode = useCallback(() => {
    setMoreOpen(false)
    setRailIsOpen(false)
    setView('editor')
  }, [setRailIsOpen, setView])

  const showPdf = useCallback(() => {
    setMoreOpen(false)
    setRailIsOpen(false)
    setView('pdf')
    if (uncompiled && !compiling) {
      startCompile()
    }
  }, [setRailIsOpen, setView, uncompiled, compiling, startCompile])

  const openRail = useCallback(
    (tab: RailTabKey) => {
      setMoreOpen(false)
      openTab(tab)
    },
    [openTab]
  )

  const openHistory = useCallback(() => {
    setMoreOpen(false)
    setRailIsOpen(false)
    setView('history')
  }, [setRailIsOpen, setView])

  if (!isMobile || view === 'history') {
    return null
  }

  const filesActive = railIsOpen && selectedTab === 'file-tree'
  const otherRailActive = railIsOpen && selectedTab !== 'file-tree'

  return (
    <>
      {railIsOpen && (
        <button
          type="button"
          className="noctex-mobile-backdrop"
          aria-label={labels.closePanel}
          onClick={() => setRailIsOpen(false)}
        />
      )}
      {moreOpen && (
        <div className="noctex-mobile-more" role="menu">
          <button type="button" role="menuitem" onClick={() => openRail('full-project-search')}>
            <MaterialIcon type="search" /> {labels.search}
          </button>
          <button type="button" role="menuitem" onClick={() => openRail('chat')}>
            <MaterialIcon type="forum" /> {labels.chat}
          </button>
          <button type="button" role="menuitem" onClick={() => openRail('review-panel')}>
            <MaterialIcon type="rate_review" /> {labels.review}
          </button>
          <button type="button" role="menuitem" onClick={openHistory}>
            <MaterialIcon type="history" /> {labels.history}
          </button>
        </div>
      )}
      <nav className="noctex-mobile-bar" aria-label={labels.bar}>
        <BarButton
          icon="folder_open"
          label={labels.files}
          active={filesActive}
          onClick={showFiles}
        />
        <BarButton
          icon="code"
          label={labels.code}
          active={!railIsOpen && view !== 'pdf'}
          onClick={showCode}
        />
        <BarButton
          icon={compiling ? 'hourglass_top' : 'picture_as_pdf'}
          label={compiling ? labels.compiling : labels.pdf}
          active={!railIsOpen && view === 'pdf'}
          badge={uncompiled && !compiling}
          onClick={showPdf}
        />
        <BarButton
          icon="more_horiz"
          label={labels.more}
          active={moreOpen || otherRailActive}
          expanded={moreOpen}
          onClick={() => setMoreOpen(open => !open)}
        />
      </nav>
    </>
  )
}
