import styles from "../styles/Theme.module.css";
import React from "react";
import sblLogo from './SBL_Logo.jpg';


export default function ThirdwebGuideFooter() {
  const url = "https://www.sneakybirdlabs.com/";
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: -120,
          right: -80,
          height: 300,
          width: 150,
          border: "1px solid #eaeaea",
          transform: "rotate(45deg)",
          backgroundColor: " #262935",
          cursor: "pointer",
        }}
        role="button"
        onClick={() => window.open(url, "_blank")}
      />

      <p>For security thid mint is a stand alone site. for more information, visit <a className={styles.footerDesc} href="https://www.furyofthefur.com">furyofthefur.com</a></p>

      <div
        style={{
          position: "fixed",
          bottom: 10,
          right: 15,
        }}
      >
        <img
          src={sblLogo.src}
          width={50}
          height={30}
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => window.open(url, "_blank")}
        />
      </div>
    </>
  );
}
