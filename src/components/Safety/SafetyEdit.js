import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
const SafetyEditCell = React.memo(({
  fieldName,
  label,
  required,
  value: propValue,
  onChange,
  rowData,
  allSepareteData,
  flattenedConnect,
  selectedSourceValues,
  handleSourceSelection,
  isSourceField,
  isDestinationField,
  getDestinationValuesForField
}) => {
  const [localValue, setLocalValue] = useState(propValue || "");
  const rowId = rowData?.id || rowData?.tableData?.id;
  
  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(propValue || "");
  }, [propValue]);
  
  const isSource = isSourceField(fieldName);
  const isDestination = isDestinationField(fieldName);
  
  // Get destination values if this is a destination field
  let destinationOptions = [];
  if (isDestination) {
    destinationOptions = getDestinationValuesForField(fieldName, rowId);
  }
  
  // Get separate library values
  const separateOptions = allSepareteData
    ?.filter(item => item.sourceName === fieldName)
    .map(item => item.sourceValue) || [];
  
  // Combine all options
  const allOptions = [...new Set([...destinationOptions, ...separateOptions])];
  const hasError = required && (!localValue || localValue.trim() === "");
  
  const handleChange = (newValue) => {
    setLocalValue(newValue);
    
    // IMPORTANT: Call Material Table's onChange
    onChange(newValue);
    
    // Update source values if this is a source field
    if (isSource) {
      handleSourceSelection(fieldName, newValue, rowId);
    }
  };
  
  // Show dropdown if we have options
  if (allOptions.length > 0) {
    const options = allOptions.map(opt => ({
      value: opt,
      label: opt,
      isDestination: destinationOptions.includes(opt)
    }));
    
    const selectedOption = options.find(opt => opt.value === localValue) || 
                          (localValue ? { value: localValue, label: localValue } : null);
    
    return (
      <div style={{ position: "relative" }}>
        <CreatableSelect
          key={`${rowId}-${fieldName}`}
          value={selectedOption}
          options={options}
          onChange={(option) => {
            const newValue = option?.value || "";
            handleChange(newValue);
          }}
          onCreateOption={(inputValue) => {
            handleChange(inputValue);
          }}
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              borderColor: hasError ? "#d32f2f" : base.borderColor,
              minHeight: "40px",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.data?.isDestination ? '#e8f4fd' : base.backgroundColor,
              fontWeight: state.data?.isDestination ? 'bold' : base.fontWeight,
            }),
          }}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {hasError && (
          <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "2px" }}>
            {label} is required
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={required ? `${label} *` : label}
          style={{
            height: "40px",
            borderRadius: "4px",
            width: "100%",
            borderColor: hasError ? "#d32f2f" : "#ccc",
            padding: "0 8px",
          }}
        />
        {hasError && (
          <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: "2px" }}>
            {label} is required
          </div>
        )}
      </div>
    );
  }
});

export default SafetyEditCell;