import React, { createContext, ReactNode, useState } from 'react';

interface PointsContextValue {
  points: number;
  setPoints: (points: number) => void;
  addPoints: (points: number) => void;
}

export const PointsContext = createContext<PointsContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function PointsProvider({ children }: Props) {
  const [points, setPoints] = useState(0);

  function addPoints(value: number) {
    setPoints((currentPoints) => currentPoints + value);
  }

  return (
    <PointsContext.Provider value={{ points, setPoints, addPoints }}>
      {children}
    </PointsContext.Provider>
  );
}