
const themeColor = function colorAlpha(a: number) {
    return `#EACC9D`
}

const styles = {
    themeColor: themeColor(1),
    themeColorAlpha: (a: number) => {
        return themeColor(a)
    },
    borderRadius: "6px",
    borderRadiusXl: "12px",
    transition: "all 0.2s ease",
    transitionXl: "all 0.5s ease",
    transition2xl: "all 0.8s ease",
    selectedBorderColor : "black",
    stressColor: "rgb(237,41,57)",
    stressColor2: "#FFCC00"


}

export default styles


