export const customStyles = {
    control: (base, state) => ({
      ...base,
      background: undefined,
      color: "white",
      // match with the menu
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      // Overwrittes the different states of border
      // borderColor: state.isFocused ? "blue" : "#1d1464",
      // Removes weird border around container
      boxShadow: state.isFocused ? null : null,
      "&:hover": {
        // Overwrittes the different states of border
        borderColor: state.isFocused ? "" : "#1d1464",
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      background: isFocused ? "#ced4da" : isSelected ? "#1d1464" : undefined,
      color: isFocused ? "black" : isSelected ? "white" : undefined,
      zIndex: 1,
    }),
    menu: (base) => ({
      ...base,
      // override border radius to match the box
      borderRadius: 0,
      // kill the gap
      marginTop: 0,
    }),
    menuList: (base) => ({
      ...base,
      // kill the white space on first and last option
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999 
    })
  };