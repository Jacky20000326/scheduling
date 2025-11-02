import { useState } from "react";
import styles from "./SaveSuccessPopup.module.css";

interface SaveSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export const SaveSuccessPopup = ({
  isOpen,
  onClose,
  shareUrl,
}: SaveSuccessPopupProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("複製網址失敗:", error);
      alert("複製失敗，請手動複製網址。");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="關閉彈窗"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.iconWrapper}>
          <svg
            className={styles.successIcon}
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle cx="32" cy="32" r="32" fill="#10b981" />
            <path
              d="M20 32l8 8 16-16"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className={styles.title}>分享排班表</h2>
        <p className={styles.description}>
          您的排班資料已自動保存到網址列中。
          <br />
          複製以下網址即可分享排班表給其他人：
        </p>

        <div className={styles.urlContainer}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className={styles.urlInput}
            onClick={(e) => e.currentTarget.select()}
          />
          <button
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
            onClick={handleCopyUrl}
          >
            {copied ? (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 10l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                已複製
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 14V4a2 2 0 0 1 2-2h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                複製網址
              </>
            )}
          </button>
        </div>

        <button className={styles.okButton} onClick={onClose}>
          確定
        </button>
      </div>
    </div>
  );
};
