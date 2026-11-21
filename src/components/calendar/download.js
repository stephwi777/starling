// DOWNLOAD

export function download(name, text) {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}



// LINKS

export function eventLink(event) {
  const month = event.day.slice(0, 7)

  return `${window.location.origin}${import.meta.env.BASE_URL}calendar?month=${month}&event=${encodeURIComponent(event.id)}`
}
