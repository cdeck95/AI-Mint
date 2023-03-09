import styles from "../styles/Theme.module.css";
import React, { useEffect, useState } from "react";
import sblLogo from './SBL_Logo.jpg';
import Image from "next/image";import {
  useMediaQuery,
  useTheme,
} from "@mui/material";


export default function ThirdwebGuideFooter() {
  const url = "https://www.sneakybirdlabs.com/";
  
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const [cornerHeight, setCornerHeight] = useState(300); 
  const [cornerWidth, setCornerWidth] = useState(150); 
  const [rightOffset, setRightOffset] = useState(15); 
  const [bottomOffset, setBottomOffset] = useState(10); 

  useEffect(() => {
    if(isMobile){
      setCornerHeight(280);
      setCornerWidth(130);
      setRightOffset(8);
      setBottomOffset(8);
      return;
    } 
  }, [isMobile]);

  
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: -120,
          right: -80,
          height: cornerHeight,
          width: cornerWidth,
          border: "1px solid #eaeaea",
          transform: "rotate(45deg)",
          backgroundColor: " #262935",
          cursor: "pointer",
        }}
        role="button"
        onClick={() => window.open(url, "_blank")}
      />

      <p className={isMobile? styles.footer : ""}>For security thid mint is a stand alone site. <br></br>For more information, visit <a className={styles.footerDesc} href="https://www.furyofthefur.com">furyofthefur.com</a></p>

      <div
        style={{
          position: "fixed",
          bottom: bottomOffset,
          right: rightOffset
        }}
      >
        <Image
          src={sblLogo.src}
          width={isMobile? 40 : 50}
          height={isMobile? 25 : 30}
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => window.open(url, "_blank")} alt={"SBL Logo"}        />
      </div>
    </>
  );
}
