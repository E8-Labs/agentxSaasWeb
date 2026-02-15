'use client'

import { MenuList } from '@mui/material'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { useForkRef } from '@mui/material/utils'

/**
 * Menu list with sliding pill background on hover – same interaction as agency sidebar.
 * Used by all agency Select/combobox dropdowns for consistent interaction and styling.
 */
function SlidingPillMenuList(props, ref) {
  const { children, onMouseLeave, ...rest } = props
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [pillStyle, setPillStyle] = useState(null)
  const [pillScaleIn, setPillScaleIn] = useState(false)

  const mergedRef = useForkRef(ref, containerRef)

  useLayoutEffect(() => {
    if (hoveredIndex === null || !containerRef.current) {
      setPillStyle(null)
      setPillScaleIn(false)
      return
    }
    const itemEl = itemRefs.current[hoveredIndex]
    const containerEl = containerRef.current
    if (!itemEl || !containerEl) return
    const itemRect = itemEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    setPillStyle({
      left: itemRect.left - containerRect.left,
      top: itemRect.top - containerRect.top,
      width: itemRect.width,
      height: itemRect.height,
    })
    setPillScaleIn(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPillScaleIn(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [hoveredIndex])

  const handleMouseLeave = (e) => {
    setHoveredIndex(null)
    onMouseLeave?.(e)
  }

  return (
    <MenuList
      ref={mergedRef}
      onMouseLeave={handleMouseLeave}
      {...rest}
      sx={{ position: 'relative', ...rest.sx }}
    >
      {hoveredIndex !== null && pillStyle && (
        <div
          className="pointer-events-none absolute z-0 rounded-xl bg-[#f9f9f9] transition-all duration-200 ease-out"
          style={{
            left: pillStyle.left,
            top: pillStyle.top,
            width: pillStyle.width,
            height: pillStyle.height,
            transform: pillScaleIn ? 'scale(1)' : 'scale(0.95)',
          }}
          aria-hidden
        />
      )}
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child
        return React.cloneElement(child, {
          ref: (el) => {
            itemRefs.current[index] = el
            const childRef = child.ref
            if (typeof childRef === 'function') childRef(el)
            else if (childRef) childRef.current = el
          },
          onMouseEnter: (e) => {
            child.props.onMouseEnter?.(e)
            setHoveredIndex(index)
          },
          sx: {
            ...child.props.sx,
            paddingTop: 0,
            paddingBottom: 0,
            height: 38,
            minHeight: 38,
          },
        })
      })}
    </MenuList>
  )
}

export const SlidingPillMenuListForwarded = React.forwardRef(SlidingPillMenuList)

/**
 * Shared MenuProps for all agency Select/combobox dropdowns: same backdrop interaction,
 * sliding pill list, paper and list styling.
 */
export function getAgencySelectMenuProps() {
  return {
    slots: { list: SlidingPillMenuListForwarded },
    slotProps: {
      backdrop: {
        sx: { backgroundColor: 'transparent' },
      },
    },
    PaperProps: {
      style: {
        maxHeight: '30vh',
        overflow: 'auto',
        scrollbarWidth: 'none',
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 12,
        border: '1px solid #eaeaea',
      },
    },
    MenuListProps: {
      sx: {
        py: 0,
        '& .MuiMenuItem-root': { marginBottom: 0, fontSize: 14 },
        '& .MuiMenuItem-root.Mui-selected': {
          color: 'hsl(var(--brand-primary))',
          backgroundColor: 'rgba(0,0,0,0.02)',
        },
      },
    },
  }
}
