"use client"
import React, { createContext, useContext, useState } from 'react'

type LoadingContextType = {
  isChartReady: boolean
  setChartReady: (ready: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isChartReady: true,
  setChartReady: () => {},
})

export const useLoadingContext = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isChartReady, setChartReady] = useState(false)
  return (
    <LoadingContext.Provider value={{ isChartReady, setChartReady }}>
      {children}
    </LoadingContext.Provider>
  )
}
