  const updateFmeca = async (values) => {
    const mandatoryFields = [
      'operatingPhase',
      'function',
      'failureMode',
      'failureModeRatioAlpha',
      'subSystemEffect',
      'systemEffect',
      'endEffect',
      'endEffectRatioBeta',
      'safetyImpact',
      'realibilityImpact'
    ];

    const missingFields = mandatoryFields.filter(field => {
      const value = values[field];
      return !value || value?.toString()?.trim() === '';
    });

    if (missingFields.length > 0) {
      const fieldLabels = {
        operatingPhase: "Operating Phase",
        function: "Function",
        failureMode: "Failure Mode",
        failureModeRatioAlpha: "Failure Mode Ratio Alpha",
        subSystemEffect: "Sub System Effect",
        systemEffect: "System Effect",
        endEffect: "End Effect",
        endEffectRatioBeta: "End Effect Ratio Beta",
        safetyImpact: "Safety Impact",
        realibilityImpact: "Reliability Impact"
      };

      const missingFieldNames = missingFields.map(field => fieldLabels[field]);

      let errorMessage;
      if (missingFields.length === 1) {
        errorMessage = `${fieldLabels[missingFields[0]]} is required!`;
      } else {
        errorMessage = `The following fields are required:\n• ${missingFieldNames.join("\n• ")}`;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        style: {
          whiteSpace: 'pre-line',
          maxWidth: '500px',
          textAlign: 'left'
        }
      });
      throw new Error("Validation failed");
    }
    
    const companyId = localStorage.getItem("companyId");
    if (!values.operatingPhase || !values.function || !values.failureMode) {
      toast.error("Operating Phase, Function, and Failure Mode are required.");
      return;
    }
    
    const payload = {
      operatingPhase: values.operatingPhase,
      function: values.function,
      failureMode: values.failureMode,
      failureModeRatioAlpha: values?.failureModeRatioAlpha || 0,
      cause: values.cause,
      detectableMeansDuringOperation: values.detectableMeansDuringOperation,
      detectableMeansToMaintainer: values.detectableMeansToMaintainer,
      BuiltInTest: values.BuiltInTest,
      subSystemEffect: values.subSystemEffect,
      systemEffect: values.systemEffect,
      endEffect: values.endEffect,
      endEffectRatioBeta: values?.endEffectRatioBeta || 0,
      safetyImpact: values.safetyImpact,
      referenceHazardId: values.referenceHazardId,
      realibilityImpact: values.realibilityImpact,
      serviceDisruptionTime: values.serviceDisruptionTime,
      frequency: values.frequency,
      severity: values.severity,
      riskIndex: values.riskIndex,
      designControl: values.designControl,
      maintenanceControl: values.maintenanceControl,
      exportConstraints: values.exportConstraints,
      immediteActionDuringOperationalPhase: values.immediteActionDuringOperationalPhase,
      immediteActionDuringNonOperationalPhase: values.immediteActionDuringNonOperationalPhase,
      userField1: values.userField1,
      userField2: values.userField2,
      userField3: values.userField3,
      userField4: values.userField4,
      userField5: values.userField5,
      userField6: values.userField6,
      userField7: values.userField7,
      userField8: values.userField8,
      userField9: values.userField9,
      userField10: values.userField10,
      treeStructureId: treeStructure,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      fmecaId: values.id,
      userId: userId,
      Alldata: tableData,
    };

    try {
      const response = await Api.patch("api/v1/FMECA/update", payload);
      if (response?.status === 200) {
        toast.success("FMECA updated successfully!");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
      else if (response?.status === 204) {
        toast.error("Failure Mode Radio Alpha Must be Equal to One !");
      }
      else {
        toast.warning("Update request completed, but status not ideal.");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
    } catch (error) {
      const errorStatus = error?.response?.status;
      if (errorStatus === 401) {
        logout();
      } else {
        toast.error(errorStatus?.response?.status === 422 ? "Failed to update FMECA. Please try again." : "Failure Mode Ratio Alpha must sum to exactly 1");
        console.error("Update Error:", errorStatus?.response?.status === 422);
      }
    } finally {
      setIsLoading(false);
    }
  };
