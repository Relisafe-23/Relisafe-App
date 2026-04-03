import React, { createContext, useContext, useState } from 'react';

const ProbabilityContext = createContext();

export const useProbability = () => {
  const context = useContext(ProbabilityContext);
  return context;
};

export const ProbabilityProvider = ({ children }) => {
  const [isProbabilityModalOpen, setIsProbabilityModalOpen] = useState(false);
  const [probabilityParams, setProbabilityParams] = useState(null);

  const openProbabilityModal = () => {
    setIsProbabilityModalOpen(true);
  };

  const closeProbabilityModal = () => {
    setIsProbabilityModalOpen(false);
  };

  const submitProbabilityCalculation = (values) => {
    setProbabilityParams(values);
    setIsProbabilityModalOpen(false);
  };

  return (
    <ProbabilityContext.Provider
      value={{
        isProbabilityModalOpen,
        probabilityParams,
        openProbabilityModal,
        closeProbabilityModal,
        submitProbabilityCalculation
      }}
    >
      {children}
    </ProbabilityContext.Provider>
  );
};