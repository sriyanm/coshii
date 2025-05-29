import React, { JSX, useState, useRef, useEffect } from "react";
import { SiFacebook, SiX, SiInstagram } from "react-icons/si";
import { Shop } from "../types";

interface DMCreatorButtonProps {
  shopData: Shop;
}

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  Facebook: <SiFacebook size={20} color="black" />,
  X: <SiX size={20} color="black" />,
  Instagram: <SiInstagram size={20} color="black" />,
};

export const DMCreatorButton: React.FC<DMCreatorButtonProps> = ({
  shopData,
}) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (expanded) {
      requestAnimationFrame(() => {
        setAnimateIn(true);
        setAnimateOut(false);
      });
    } else {
      setAnimateIn(false);
    }
  }, [expanded]);

  const handleMainButtonClick = () => {
    setExpanded(true);
  };

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank");
  };

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAnimateIn(false);
        setAnimateOut(true); // trigger exit animation
        setTimeout(() => {
          setExpanded(false);
          setAnimateOut(false);
        }, 300); // match transition duration
      }
    };

    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl mt-2 ${expanded ? "inline-flex" : "w-11/12"}`}
    >
      {!expanded ? (
        <button
          onClick={handleMainButtonClick}
          className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow"
        >
          DM Creator
        </button>
      ) : (
        <div className="relative">
          {shopData.socialLinks.map((link, index) => {
            const icon = SOCIAL_ICONS[link.platform];
            if (!icon) return null;

            return (
              <button
                key={index}
                onClick={() => handleSocialClick(link.url)}
                className={`mr-1 rounded-full bg-white p-2 px-4 shadow transition-all duration-300 ease-in-out ${
                  animateIn
                    ? "translate-x-0 opacity-100"
                    : animateOut
                      ? "-translate-x-4 opacity-0"
                      : "-translate-x-4 opacity-0"
                }`}
              >
                {icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
