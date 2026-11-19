import { useEffect } from 'react'
import { useLocation } from 'react-router'



// SCROLL TO TOP

function ScrollToTop() {
  const { pathname } = useLocation()
  const section = pathname.split('/')[1]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [section])

  return null
}

export default ScrollToTop
