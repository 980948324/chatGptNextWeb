"use client";

require("../polyfill");

import { useState, useEffect, StyleHTMLAttributes } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && 
	  <img src="/bots.png" height="30" width="30" />
	  }
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--themeColor");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function WideScreen() {
  const config = useAppConfig();

  return (
    <div
      className={`${
        config.tightBorder ? styles["tight-container"] : styles.container
      }`}
    >
      <SideBar />

      <div className={styles["window-content"]}>
        <Routes>
          <Route path={Path.Home} element={<Chat />} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

function MobileScreen() {
  const location = useLocation();
  const isHome = location.pathname === Path.Home;

  return (
    <div className={styles.container}>
      <SideBar className={isHome ? styles["sidebar-show"] : ""} />

      <div className={styles["window-content"]}>
        <Routes>
          <Route path={Path.Home} element={null} />
          <Route path={Path.Chat} element={<Chat />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export function Home() {
  const isMobileScreen = useMobileScreen();
  useSwitchTheme();

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>{isMobileScreen ? <MobileScreen /> : <WideScreen />}</Router>
    </ErrorBoundary>
  );
}
