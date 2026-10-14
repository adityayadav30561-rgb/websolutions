import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import WorkDetail from "./pages/WorkDetail";
import WorkIndex from "./pages/WorkIndex";
import { startSmoothScroll } from "./lib/scroll";
import { startSound } from "./lib/sound";
import { startReactiveContent } from "./world/react";
import { WorldProvider } from "./world/World";

/** Start each page at the top; in-page anchors on the homepage are left alone. */
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Arriving from another page with a section in the address: the page is built by now, so go to it.
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView();
      return;
    }
    if (window.location.hash) return;
    const html = document.documentElement;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = "";
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => startSound(), []);
  useEffect(() => {
    // Inertial scrolling and cursor-reactive content, unless the visitor asked for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stopScroll = startSmoothScroll();
    const stopReact = startReactiveContent();
    return () => {
      stopScroll();
      stopReact();
    };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <WorldProvider>
      <ScrollReset />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/work" element={<WorkIndex />} />
        <Route path="/work/:slug" element={<WorkDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </WorldProvider>
    </MotionConfig>
  );
}
