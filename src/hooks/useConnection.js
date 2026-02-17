import { useState, useEffect, useCallback } from 'react';
import Api from '../Api';
import { toast } from 'react-toastify';

export const useConnection = () => {
  const [connections, setConnections] = useState([]);
  const [sourceValues, setSourceValues] = useState({});
  const [destinationValues, setDestinationValues] = useState({});
  const [verifiedSources, setVerifiedSources] = useState({});

  // Load all connections from API
  const loadConnections = useCallback(async (projectId) => {
    try {
      const response = await Api.get("api/v1/library/get/all/connect/value", {
        params: { projectId }
      });
      
      const allConnections = response.data.getData || [];
      
      // Filter connections for FMECA and MTTR
      const filteredConnections = allConnections.filter(conn => 
        conn?.libraryId?.moduleName === 'FMECA' || 
        conn?.libraryId?.moduleName === 'MTTR' ||
        conn?.destinationModuleName === 'FMECA' || 
        conn?.destinationModuleName === 'MTTR'
      );
      
      setConnections(filteredConnections);
      return filteredConnections;
    } catch (error) {
      console.error('Error loading connections:', error);
      return [];
    }
  }, []);




  // Check and update destinations based on source
  const checkAndUpdateDestinations = useCallback(async (sourceModule, sourceRowId, sourceField, sourceValue) => {
    try {
      // Find all connections where this field is a source
      const relevantConnections = connections.filter(conn => 
        conn.sourceName === sourceField && 
        conn.sourceValue === sourceValue
      );

      for (const conn of relevantConnections) {
        // For each destination, update the value
        const destinationData = conn.destinationData || [];
        
        for (const dest of destinationData) {
          if (dest.destinationModuleName === 'MTTR') {
            // Update MTTR destination
            await updateMTTRDestination(
              dest.destinationName,
              dest.destinationValue,
              sourceModule,
              sourceField,
              sourceValue
            );
          } else if (dest.destinationModuleName === 'FMECA') {
            // Update FMECA destination
            await updateFMECADestination(
              dest.destinationName,
              dest.destinationValue,
              sourceModule,
              sourceField,
              sourceValue
            );
          }
        }
      }
    } catch (error) {
      console.error('Error updating destinations:', error);
    }
  }, [connections]);
const saveSource = useCallback(async (moduleName, rowId, fieldName, value) => {
  try {
    const isValid = value !== null && value !== undefined && value !== "";

    if (isValid) {
      setVerifiedSources(prev => ({
        ...prev,
        [`${moduleName}_${rowId}_${fieldName}`]: {
          verified: true,
          verifiedAt: new Date().toISOString(),
          value
        }
      }));
  console.log("Verified source saved:", { moduleName, rowId, fieldName, value });
      toast.success(`${fieldName} verified successfully!`);

      await checkAndUpdateDestinations(moduleName, rowId, fieldName, value);

      return true;
    } else {
      toast.error("Verification failed: Value is empty");
      return false;
    }

  } catch (error) {
    console.error('Error verifying source:', error);
    toast.error('Verification failed');
    return false;
  }
}, [checkAndUpdateDestinations]);
  // Update MTTR destination
  const updateMTTRDestination = useCallback(async (destField, destValue, sourceModule, sourceField, sourceValue) => {
    setDestinationValues(prev => ({
      ...prev,
      [`MTTR_${destField}`]: {
        value: destValue,
        sourceModule,
        sourceField,
        sourceValue,
        timestamp: new Date().toISOString()
      }
    }));

    // You can trigger a re-render or event here
    window.dispatchEvent(new CustomEvent('mttrDestinationUpdated', {
      detail: { destField, destValue, sourceModule, sourceField, sourceValue }
    }));
  }, []);

  // Update FMECA destination
  const updateFMECADestination = useCallback(async (destField, destValue, sourceModule, sourceField, sourceValue) => {
    setDestinationValues(prev => ({
      ...prev,
      [`FMECA_${destField}`]: {
        value: destValue,
        sourceModule,
        sourceField,
        sourceValue,
        timestamp: new Date().toISOString()
      }
    }));

    window.dispatchEvent(new CustomEvent('fmecaDestinationUpdated', {
      detail: { destField, destValue, sourceModule, sourceField, sourceValue }
    }));
  }, []);

  // Verify a source value
  const verifySource = useCallback(async (moduleName, rowId, fieldName, value) => {
    try {
      // Call API to verify
      const response = await Api.post("api/v1/library/verify/source", {
        moduleName,
        rowId,
        fieldName,
        fieldValue: value
      });

      if (response.data.verified) {
        setVerifiedSources(prev => ({
          ...prev,
          [`${moduleName}_${rowId}_${fieldName}`]: {
            verified: true,
            verifiedAt: new Date().toISOString(),
            value
          }
        }));

        toast.success(`${fieldName} verified successfully!`);
        
        // Trigger destination updates since source is now verified
        await checkAndUpdateDestinations(moduleName, rowId, fieldName, value);
        
        return true;
      } else {
        toast.error(`Verification failed: ${response.data.reason}`);
        return false;
      }
    } catch (error) {
      console.error('Error verifying source:', error);
      toast.error('Verification failed');
      return false;
    }
  }, [checkAndUpdateDestinations]);

  // Get destinations for a specific row
  const getDestinationsForRow = useCallback((moduleName, rowId) => {
    const destinations = [];
    
    Object.entries(destinationValues).forEach(([key, value]) => {
      if (key.startsWith(moduleName)) {
        destinations.push({
          field: key.replace(`${moduleName}_`, ''),
          ...value
        });
      }
    });
    
    return destinations;
  }, [destinationValues]);

  // Check if a field has verified source
  const isSourceVerified = useCallback((moduleName, rowId, fieldName) => {
    return verifiedSources[`${moduleName}_${rowId}_${fieldName}`]?.verified || false;
  }, [verifiedSources]);

  // Get source verification details
  const getSourceVerification = useCallback((moduleName, rowId, fieldName) => {
    return verifiedSources[`${moduleName}_${rowId}_${fieldName}`] || null;
  }, [verifiedSources]);

  return {
    connections,
    sourceValues,
    destinationValues,
    verifiedSources,
    loadConnections,
    saveSource,
    verifySource,
    getDestinationsForRow,
    isSourceVerified,
    getSourceVerification
  };
};