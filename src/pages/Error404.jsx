import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Error404.module.css";
import Constellation from "../assets/images/404-constellation.svg"; 

export default function Error404() {
  return (
    <div className={styles.wrap}>
      <div className={styles.vignette} aria-hidden />
      <div className={styles.twinkle} aria-hidden />

      <h1 className={styles.title}>You've wandered off your path, stargazer</h1>
      
      <img src={Constellation} alt="404" className={styles.constellation} />

      <p className={styles.desc}>
        This page doesn't exist - but the moon will light your way home.
      </p>
      <br />
      <br />
      <br />
      <br />
      <br />
      <Link to="/" className={styles.cta}>Return to Celestia</Link>
    </div>
  );
}