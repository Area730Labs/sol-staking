import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import useWindowDimensions from "./windowsize";

export function Line(props: { top: number }) {
  return <Box position="absolute" height="0" width="100vw" border="1px solid #FFFFFF" top={props.top + "px"}></Box>
}

export function VerticalLine(props: { left: number, top: number, key: any }) {
  return <Box position="absolute" top={props.top+"px"} height="70vh" width="0" border="1px solid #FFFFFF" left={props.left + "px"}></Box>
}

export function Lines() {

  const boxSizeWidth = 110;
  const linesCountH = 4;

  const {width } = useWindowDimensions();


  const result = useMemo(() => {

    let subresult = [];

    for (let i = 0; i < linesCountH; i++) {
      const hOffset = boxSizeWidth * i;
      subresult.push(<Line top={hOffset} key={i}></Line>)
    }

    return subresult;

  }, [])


  const verticalLines = useMemo(() => {

    let subresult = [];
    const vLines = width/boxSizeWidth; 

    for (let i = 0; i < vLines ; i ++ ) {
      const hOffset = boxSizeWidth * i;

      let topOffset = boxSizeWidth;

      if (i == 1) {
        topOffset = 0;
      }

      subresult.push(<VerticalLine left={hOffset} top={topOffset} key={i}/>)
    }

    return subresult;

  },[width]);


  return <>{result} {verticalLines}</>

}