"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

export default function ResumeDrawer({ isOpen, onClose, night = false }) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const frame = requestAnimationFrame(() => {
        dialog.classList.add("is-visible");
      });
      return () => cancelAnimationFrame(frame);
    } else if (dialog.open) {
      dialog.classList.remove("is-visible");
      const timer = setTimeout(() => {
        if (!isOpen && dialog.open) {
          dialog.close();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleShareOrCopy = () => {
    const resumeUrl = `${window.location.origin}/Tauheed_Mulla_Resume.pdf`;
    navigator.clipboard?.writeText(resumeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className={`resume-drawer-dialog ${night ? "theme-night" : "theme-day"}`}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="resume-drawer-title"
    >
      <div className="resume-drawer-sheet" role="document">
        {/* Drawer Header */}
        <header className="resume-drawer-header">
          <div className="resume-header-info">
            <div className="resume-header-badge">
              <span className="resume-live-dot" aria-hidden="true" />
              <span>Official Document</span>
            </div>
            <h2 id="resume-drawer-title" className="resume-title">
              Tauheed Mulla
              <span className="resume-subtitle"> · Curriculum Vitae</span>
            </h2>
          </div>

          <div className="resume-header-actions">
            <button
              type="button"
              className="resume-pill-btn share-btn"
              onClick={handleShareOrCopy}
              title="Copy link to resume"
              aria-label="Copy link to resume"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} strokeWidth={2.4} className="copy-ok-icon" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FileText size={13} strokeWidth={2} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href="/Tauheed_Mulla_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="resume-pill-btn"
              title="Open in new window"
              aria-label="Open résumé in new window"
            >
              <ExternalLink size={13} strokeWidth={2} />
              <span>Open Tab</span>
            </a>

            <a
              href="/Tauheed_Mulla_Resume.pdf"
              download="Tauheed_Mulla_Resume.pdf"
              className="resume-pill-btn primary-action"
              title="Download PDF copy"
              aria-label="Download PDF copy of résumé"
            >
              <Download size={13} strokeWidth={2.2} />
              <span>Download</span>
            </a>

            <button
              type="button"
              className="resume-close-btn"
              onClick={onClose}
              title="Close drawer (Esc)"
              aria-label="Close résumé drawer"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Drawer Document Body */}
        <div className="resume-drawer-body">
          {/* Mobile Document View: Full-width, crisp, multi-page render without iframe squishing */}
          <div className="resume-mobile-doc-view">
            <div className="resume-doc-page">
              <span className="resume-page-pill">Page 1 of 2</span>
              <img
                src="/resume-page-1.png"
                alt="Tauheed Mulla Résumé - Page 1"
                className="resume-page-render"
                loading="eager"
              />
            </div>
            <div className="resume-doc-page">
              <span className="resume-page-pill">Page 2 of 2</span>
              <img
                src="/resume-page-2.png"
                alt="Tauheed Mulla Résumé - Page 2"
                className="resume-page-render"
                loading="lazy"
              />
            </div>
          </div>

          {/* Desktop PDF Iframe (With FitW to fit full container width) */}
          <iframe
            src="/Tauheed_Mulla_Resume.pdf#view=FitW&toolbar=0&navpanes=0"
            title="Tauheed Mulla Curriculum Vitae"
            className="resume-pdf-viewport"
          />
        </div>
      </div>
    </dialog>
  );
}
