"use client";

import { useEffect, useState } from "react";
import { X, FileText, ArrowUpRight } from "lucide-react";
import "./mobile-nav.css";

export default function MobileNavMenu({
  isOpen,
  onClose,
  navigation = [],
  activeId = null,
  onSelectSection,
  onResumeClick,
  night = false,
  profile = {},
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle slide-in and slide-out transitions
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Double rAF ensures the element is in the DOM before starting the slide-in transition
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
      // Wait for slide-out transition to complete before unmounting
      const timer = setTimeout(() => {
        setMounted(false);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key, window resize, and handle scroll locking
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 800) {
        onClose();
      }
    };

    // Lock body scroll while mobile menu is open
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, onClose]);

  // Handle section click
  const handleItemClick = (e, id) => {
    e.preventDefault();
    onClose();
    // Allow state transition and unblock scroll before moving
    requestAnimationFrame(() => {
      if (onSelectSection) {
        onSelectSection(id);
      }
    });
  };

  // Handle Résumé drawer trigger
  const handleResume = (e) => {
    e.preventDefault();
    onClose();
    setTimeout(() => {
      if (onResumeClick) {
        onResumeClick();
      }
    }, 150);
  };

  if (!mounted) return null;

  return (
    <div
      className={`mobile-nav-overlay ${visible ? "is-visible" : ""} ${night ? "theme-night" : "theme-day"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
    >
      <div className="mobile-nav-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="mobile-nav-panel">
        {/* Panel Header Bar */}
        <div className="mobile-nav-header-bar">
          <div className="mobile-nav-brand">
            <span className="logo-slot" aria-hidden="true">
              {profile.logo ? <img src={profile.logo} alt="" /> : <span>TM</span>}
            </span>
            <span className="mobile-nav-name">{profile.name}</span>
          </div>

          <button
            type="button"
            className="mobile-nav-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Section: Nav Controls (Without CURRENT badge) */}
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            {navigation.map((item, index) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
                  onClick={(e) => handleItemClick(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                >
                  <div className="mobile-nav-item-left">
                    <span className="mobile-nav-idx">0{index + 1}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                  </div>
                  <div className="mobile-nav-item-right">
                    <span className="mobile-nav-arrow" aria-hidden="true">→</span>
                  </div>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Section: Resume, GitHub and LinkedIn buttons at footer */}
        <div className="mobile-nav-footer">
          {/* Résumé Action Button */}
          <button
            type="button"
            className="mobile-resume-action-btn"
            onClick={handleResume}
            aria-label="View official résumé"
          >
            <div className="mobile-resume-action-content">
              <span className="resume-icon-wrapper" aria-hidden="true">
                <FileText size={18} strokeWidth={2} />
              </span>
              <span className="resume-title">Resumé</span>
            </div>
            <span className="resume-pill-tag">
              <span>View</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </span>
          </button>

          {/* Social Links Row: GitHub and LinkedIn */}
          <div className="mobile-social-grid">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="mobile-social-btn"
              aria-label={`${profile.name}'s GitHub profile`}
            >
              <span className="brand-icon brand-github" aria-hidden="true" />
              <span className="social-label">GitHub</span>
              <ArrowUpRight size={14} className="social-arrow" aria-hidden="true" />
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mobile-social-btn"
              aria-label={`${profile.name}'s LinkedIn profile`}
            >
              <span className="brand-icon brand-linkedin" aria-hidden="true" />
              <span className="social-label">LinkedIn</span>
              <ArrowUpRight size={14} className="social-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
