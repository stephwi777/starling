import { useEffect, useRef, useState } from 'react'
import { PlaceContext } from './usePlace.js'
import { loadPlace, rememberAsked, roundCoordinate, savePlace, wasAsked } from './placeStorage.js'
import { canUseDeviceLocation, findDevicePlace } from './placeApi.js'
import PlaceDialog from '../components/PlaceDialog.jsx'



// PROVIDER

export function PlaceProvider({ children }) {
  const [place, setPlaceState] = useState(() => loadPlace())
  const [pickerOpen, setPickerOpen] = useState(false)
  const chosen = useRef(false)

  function savePlaceState(newPlace) {
    const rounded = {
      ...newPlace,
      latitude: roundCoordinate(newPlace.latitude),
      longitude: roundCoordinate(newPlace.longitude),
    }

    savePlace(rounded)
    setPlaceState(rounded)
  }

  function setPlace(newPlace) {
    chosen.current = true
    savePlaceState(newPlace)
  }

  useEffect(() => {
    if (loadPlace().source !== 'sample' || wasAsked() || !canUseDeviceLocation()) return

    rememberAsked()

    findDevicePlace()
      .then(found => {
        if (!chosen.current) savePlaceState(found)
      })
      .catch(() => {})
  }, [])

  const value = {
    place,
    isSample: place.source === 'sample',
    setPlace,
    pickerOpen,
    openPicker: () => setPickerOpen(true),
    closePicker: () => setPickerOpen(false),
  }

  return (
    <PlaceContext value={value}>
      {children}
      <PlaceDialog />
    </PlaceContext>
  )
}
