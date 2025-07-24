export const MenuItemHoverStyles = () => {
    return {
        '&:hover': {
            backgroundColor: '#7902DF10', // light purple
            color: '#000000',
        },

        // Selected state
        '&.Mui-selected': {
            backgroundColor: '#7902DF10', // a bit darker purple
            color: '#000000',
        },

        // Selected + Hover
        '&.Mui-selected:hover': {
            backgroundColor: '#7902DF15', // even more intense purple
            color: '#000000',
        },
        "&.Mui-focusVisible": {
            backgroundColor: "inherit",
        },
    }
}