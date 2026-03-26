import { FirecrawlMenuGrow } from './firecrawlMenuGrow'

const firecrawlMenuTransitionEasing = {
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

/** Scrollable menu list area (Firecrawl-style dropdowns) */
export const FIRECRAWL_MENU_LIST_MAX_HEIGHT_PX = 350

/** Panel: light border + medium elevation (matches in-repo “medium elevation” / firecrawl-style menus) */
export const firecrawlMenuPaperSx = {
  mt: 0.5,
  borderRadius: '12px',
  border: '1px solid #eaeaea',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
}

/** Sliding hover pill behind options/menu items */
export const firecrawlMenuListSx = {
  py: 0.75,
  px: 0.75,
  position: 'relative',
  maxHeight: FIRECRAWL_MENU_LIST_MAX_HEIGHT_PX,
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 6,
    right: 6,
    height: 'var(--fc-pill-h, 40px)',
    transform: 'translateY(var(--fc-pill-y, -9999px))',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: '10px',
    opacity: 'var(--fc-pill-o, 0)',
    transition:
      'transform 140ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 120ms ease',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  },
  '& .MuiMenuItem-root': {
    borderRadius: '10px',
    minHeight: 40,
    padding: '10px 10px',
    fontSize: 14,
    fontWeight: 400,
    transition: 'transform 140ms ease, color 140ms ease',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&:active': {
      transform: 'scale(0.99)',
    },
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      color: 'rgba(0, 0, 0, 1)',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'transparent',
    },
  },
}

/** Base MenuProps for MUI Select (sliding pill added via `...getFirecrawlMenuListMouseHandlers()` on MenuListProps) */
export const firecrawlSelectMenuPropsBase = {
  TransitionComponent: FirecrawlMenuGrow,
  transitionDuration: { enter: 230, exit: 150 },
  TransitionProps: {
    easing: firecrawlMenuTransitionEasing,
  },
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  PaperProps: { sx: { ...firecrawlMenuPaperSx } },
  MenuListProps: {
    className: 'firecrawl-menu-scrollbar',
    sx: { ...firecrawlMenuListSx },
  },
}

/** Same transition + anchor defaults for standalone MUI `<Menu />` */
export const firecrawlStandaloneMenuProps = {
  TransitionComponent: FirecrawlMenuGrow,
  transitionDuration: { enter: 230, exit: 150 },
  TransitionProps: {
    easing: firecrawlMenuTransitionEasing,
  },
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
}

export function applySlidingPillToMenuList(menuListEl, itemEl) {
  if (!menuListEl || !itemEl) return
  const menuListRect = menuListEl.getBoundingClientRect()
  const itemRect = itemEl.getBoundingClientRect()
  const y = itemRect.top - menuListRect.top
  menuListEl.style.setProperty('--fc-pill-y', `${Math.max(0, y)}px`)
  menuListEl.style.setProperty('--fc-pill-h', `${itemRect.height}px`)
  menuListEl.style.setProperty('--fc-pill-o', '1')
}

/**
 * Pointer handlers for the sliding pill. Works for Select listboxes (`role="option"`)
 * and Menu lists (`role="menuitem"`).
 */
export function getFirecrawlMenuListMouseHandlers() {
  return {
    onMouseMove: (e) => {
      const menuListEl = e.currentTarget
      const itemEl = e.target?.closest?.('[role="option"], [role="menuitem"]')
      if (!itemEl) return
      applySlidingPillToMenuList(menuListEl, itemEl)
    },
    onMouseLeave: (e) => {
      const menuListEl = e.currentTarget
      menuListEl?.style?.setProperty('--fc-pill-o', '0')
    },
  }
}

/** Chevron for Select triggers (rotates when open via aria-expanded in sx) */
export function FirecrawlChevronIcon(props) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Full `MenuProps` for MUI Select with optional Paper / MenuList overrides and sliding pill handlers.
 * @param {object} [options]
 * @param {object} [options.paperSx] — merged onto Paper `sx`
 * @param {object} [options.menuListProps] — extra MenuList props (`sx` merged; `aria-labelledby`, etc. preserved)
 */
export function buildFirecrawlSelectMenuProps(options = {}) {
  const { paperSx = {}, menuListProps = {} } = options
  const {
    sx: menuListSxExtra,
    className: menuListClassNameExtra,
    ...restMenuList
  } = menuListProps
  const menuListClassName = ['firecrawl-menu-scrollbar', menuListClassNameExtra]
    .filter(Boolean)
    .join(' ')
  return {
    ...firecrawlSelectMenuPropsBase,
    PaperProps: {
      ...firecrawlSelectMenuPropsBase.PaperProps,
      sx: { ...firecrawlMenuPaperSx, ...paperSx },
    },
    MenuListProps: {
      ...firecrawlSelectMenuPropsBase.MenuListProps,
      ...restMenuList,
      className: menuListClassName,
      sx: { ...firecrawlMenuListSx, ...(menuListSxExtra || {}) },
      ...getFirecrawlMenuListMouseHandlers(),
    },
  }
}
