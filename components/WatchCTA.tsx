"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InquiryModal } from "@/components/InquiryModal";
import { watchWhatsappLink } from "@/lib/constants";
import { formatPriceAmount, watchLabel } from "@/lib/format";
import { useLocale } from "@/components/LocaleProvider";
import type { Watch } from "@/lib/schema";

export function WatchCTA({ watch, sticky = false }: { watch: Watch; sticky?: boolean }) {
  const { dict, locale } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);

  const wrapperClass = sticky
    ? "lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-line p-4 flex gap-3"
    : "hidden lg:flex gap-3";

  if (watch.status === "sold") {
    return (
      <div className={wrapperClass}>
        <Button href="#podobne-kusy" variant="secondary" fullWidthOnMobile>
          {dict.watchDetail.similarWatches}
        </Button>
      </div>
    );
  }

  if (watch.status === "reserved") {
    return (
      <div className={wrapperClass}>
        <Button variant="primary" fullWidthOnMobile disabled>
          {dict.watchDetail.reserved}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={wrapperClass}>
        <Button
          variant="primary"
          fullWidthOnMobile
          onClick={() => setModalOpen(true)}
          data-umami-event="inquiry-open"
          data-umami-event-watch={watch.slug}
        >
          {dict.watchDetail.writeToUs}
        </Button>
        <Button
          href={watchWhatsappLink(dict.watchDetail.whatsappMessage, watchLabel(watch))}
          variant="secondary"
          fullWidthOnMobile
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="whatsapp-click"
          data-umami-event-watch={watch.slug}
        >
          {dict.watchDetail.whatsapp}
        </Button>
      </div>
      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prefilledMessage={`${dict.watchDetail.inquiryPrefix} ${watchLabel(watch)}.`}
        offerCurrency={locale === "cs" ? "Kč" : "€"}
        offerPlaceholder={formatPriceAmount(watch, locale)}
      />
    </>
  );
}
