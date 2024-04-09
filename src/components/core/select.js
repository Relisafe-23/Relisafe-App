export const customStyles = {
  control: (base, state) => ({
    ...base,
    background: undefined,
    color: "white",
    // marginTop:"5px",
    // match with the menu
    borderRadius: "5px ",
    // Overwrittes the different states of border
    borderColor: state.isFocused ? "black" : "#1d5460",
    // Removes weird border around container
    boxShadow: state.isFocused ? null : null,
    "&:hover": {
      // Overwrittes the different states of border
      borderColor: state.isFocused ? "" : "#1D5460",
    },
  }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    background: isFocused ? "#CED4DA" : isSelected ? "#1D5460" : undefined,
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
};
