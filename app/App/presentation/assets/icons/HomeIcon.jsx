import * as React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function SvgComponent(props) {
  return (
    <Svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1 13.2448C1 10.498 1 9.1252 1.624 7.9876C2.2456 6.8488 3.3844 6.1432 5.6608 4.7296L8.0608 3.2404C10.4668 1.7464 11.6704 1 13 1C14.3296 1 15.532 1.7464 17.9392 3.2404L20.3392 4.7296C22.6156 6.1432 23.7544 6.8488 24.3772 7.9876C25 9.1264 25 10.498 25 13.2436V15.07C25 19.75 25 22.0912 23.5936 23.5456C22.1872 25 19.9252 25 15.4 25H10.6C6.0748 25 3.8116 25 2.4064 23.5456C1.0012 22.0912 1 19.7512 1 15.07V13.2448Z"
        stroke="#003366"
        stroke-width="1.5"
      />
      <Path
        d="M13 16.6001V20.2001"
        stroke="#003366"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </Svg>
  );
}
