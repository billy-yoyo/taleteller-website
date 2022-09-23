
export const upperFirst = (text: string) => {
    if (text.length > 1) {
        return text.slice(0, 1).toUpperCase() + text.slice(1);
    } else {
        return text.toUpperCase();
    }
};

export const titleCase = (text: string) => {
    return text.split(" ").map(upperFirst).join(" ");
};

export const apiToTitle = (text: string) => {
    return titleCase(text.replace(/_/g, " "));
}
