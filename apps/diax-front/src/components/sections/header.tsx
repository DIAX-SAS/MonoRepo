import React from 'react';
import Image from 'next/image';
import styles from "../../app/dashboard/styles.module.scss"

const Header: React.FC = () => {
  return (
    <div className={`${styles["cube-container"]} ${styles.title}`}>
      <Image src="/assets/logo.svg" alt="Company Logo" width={100} height={100} />
      <h1 className={`${styles.h1}`}>Equipos de Inyeccion</h1>
      <div className={styles.settings}>
        <h2 className={`${styles.h2}`}>
          Live<span>Dash</span>
        </h2>
        <h2 className={`${styles.legend} ${styles.h2}`}>2.0.2.2</h2>
      </div>
    </div>
  );
};

export default Header;
