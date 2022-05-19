
const themeColor = function colorAlpha(a: number) {
    return `rgba(88,101,242,${a})`
}

const styles = {
    themeColor: themeColor(1),
    themeColorAlpha: (a: number) => {
        return themeColor(a)
    },
    borderRadius: "6px",
    transition: "all 0.2s ease",
    selectedBorderColor : "black"

}

export default styles


