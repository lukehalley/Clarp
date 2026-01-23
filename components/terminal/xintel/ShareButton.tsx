'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Link2 } from 'lucide-react';

interface ShareButtonProps {
  handle: string;
  score: number;
}

export default function ShareButton({ handle, score }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const reportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/terminal/xintel/${handle}`
    : `/terminal/xintel/${handle}`;

  const tweetText = `Just scanned @${handle} on CLARP X Intel\n\nReputation Score: ${score}/100\n\n"Know the founder before you ape."\n\n${reportUrl}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-ivory-light/20 text-ivory-light/70 hover:border-danger-orange/50 hover:text-ivory-light font-mono text-sm transition-colors"
      >
        <Share2 size={16} />
        Share
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-dark border-2 border-danger-orange/30 z-50 shadow-lg">
            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ivory-light/5 transition-colors text-left"
            >
              {copied ? (
                <Check size={18} className="text-larp-green" />
              ) : (
                <Link2 size={18} className="text-ivory-light/60" />
              )}
              <div>
                <span className="font-mono text-sm text-ivory-light block">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
                <span className="font-mono text-xs text-ivory-light/40">
                  Share report URL
                </span>
              </div>
            </button>

            {/* Tweet */}
            <button
              onClick={handleTweet}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ivory-light/5 transition-colors text-left border-t border-ivory-light/10"
            >
              <Twitter size={18} className="text-ivory-light/60" />
              <div>
                <span className="font-mono text-sm text-ivory-light block">
                  Share on X
                </span>
                <span className="font-mono text-xs text-ivory-light/40">
                  Post with score summary
                </span>
              </div>
            </button>

            {/* Preview URL */}
            <div className="px-4 py-3 border-t border-ivory-light/10 bg-ivory-light/5">
              <span className="font-mono text-xs text-ivory-light/40 break-all">
                {reportUrl}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
