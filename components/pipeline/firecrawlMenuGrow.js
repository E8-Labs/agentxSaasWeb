'use client'

/**
 * Drop-in replacement for MUI Grow on menus: subtler start scale + firecrawl-like easing.
 * Based on @mui/material/Grow (MIT); initial scale 0.75 → 0.96, uniform scale(), default easing.
 */

import * as React from 'react'
import { Transition } from 'react-transition-group'
import useTimeout from '@mui/utils/useTimeout'
import getReactElementRef from '@mui/utils/getReactElementRef'
import { getTransitionProps, reflow } from '@mui/material/transitions/utils'
import useForkRef from '@mui/utils/useForkRef'
import { useTheme } from '@mui/material/styles'

/** Subtle zoom — closer to firecrawl-style menus than MUI’s 0.75 */
const FC_INITIAL_SCALE = 0.96

const DEFAULT_EASING = {
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

const DEFAULT_TIMEOUT = { enter: 230, exit: 150 }

function getScale(value) {
  return `scale(${value})`
}

const styles = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: 'none',
  },
}

const isWebKit154 =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) &&
  /(os |version\/)15(.|_)4/i.test(navigator.userAgent)

export const FirecrawlMenuGrow = React.forwardRef(function FirecrawlMenuGrow(props, ref) {
  const {
    addEndListener,
    appear = true,
    children,
    easing: easingProp,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = DEFAULT_TIMEOUT,
    TransitionComponent = Transition,
    ...other
  } = props

  const easing = easingProp ?? DEFAULT_EASING

  const timer = useTimeout()
  const autoTimeout = React.useRef()
  const theme = useTheme()
  const nodeRef = React.useRef(null)
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref)

  const normalizedTransitionCallback =
    (callback) =>
    (maybeIsAppearing) => {
      if (callback) {
        const node = nodeRef.current
        if (maybeIsAppearing === undefined) {
          callback(node)
        } else {
          callback(node, maybeIsAppearing)
        }
      }
    }

  const handleEntering = normalizedTransitionCallback(onEntering)
  const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
    reflow(node)

    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps(
      {
        style,
        timeout,
        easing,
      },
      { mode: 'enter' },
    )

    let duration
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight)
      autoTimeout.current = duration
    } else {
      duration = transitionDuration
    }

    node.style.transition = [
      theme.transitions.create('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create('transform', {
        duration: isWebKit154 ? duration : duration * 0.666,
        delay,
        easing: transitionTimingFunction,
      }),
    ].join(',')
    if (onEnter) {
      onEnter(node, isAppearing)
    }
  })
  const handleEntered = normalizedTransitionCallback(onEntered)
  const handleExiting = normalizedTransitionCallback(onExiting)
  const handleExit = normalizedTransitionCallback((node) => {
    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps(
      {
        style,
        timeout,
        easing,
      },
      { mode: 'exit' },
    )

    let duration
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight)
      autoTimeout.current = duration
    } else {
      duration = transitionDuration
    }

    node.style.transition = [
      theme.transitions.create('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create('transform', {
        duration: isWebKit154 ? duration : duration * 0.666,
        delay: isWebKit154 ? delay : delay || duration * 0.333,
        easing: transitionTimingFunction,
      }),
    ].join(',')
    node.style.opacity = 0
    node.style.transform = getScale(FC_INITIAL_SCALE)
    if (onExit) {
      onExit(node)
    }
  })
  const handleExited = normalizedTransitionCallback(onExited)
  const handleAddEndListener = (next) => {
    if (timeout === 'auto') {
      timer.start(autoTimeout.current || 0, next)
    }
    if (addEndListener) {
      addEndListener(nodeRef.current, next)
    }
  }

  return (
    <TransitionComponent
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      timeout={timeout === 'auto' ? null : timeout}
      {...other}
    >
      {(state, { ownerState: _ownerState, ...restChildProps } = {}) =>
        React.cloneElement(children, {
          style: {
            opacity: 0,
            transform: getScale(FC_INITIAL_SCALE),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
          ...restChildProps,
        })
      }
    </TransitionComponent>
  )
})

FirecrawlMenuGrow.muiSupportAuto = true
