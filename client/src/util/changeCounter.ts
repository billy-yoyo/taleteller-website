

export const createChangeCounter = (dispatch: (name: string) => void) => {
    let changes = 0;
    return () => {
        if (changes <= 0) {
            changes++;
        } else {
            dispatch('change');
        }
    };
};
