export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={["relative inline-flex items-center -space-x-px", className].join(" ")}>
      {/* Endlink — koncový článok remienka, o niečo väčší než badge, priamo nalepený naň */}
      <svg
        viewBox="0 0 69 124"
        className="h-[37px] sm:h-[41px] w-auto text-ink shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path d="M0 0C4.83737 2.03928 9.38562 4.62896 13.5654 7.69238L48.5303 14.8037C50.8936 15.2844 50.5435 18.7637 48.1318 18.7637H25.3779C35.1278 30.3997 41 45.395 41 61.7637C41 78.6055 34.7831 93.993 24.5225 105.764H46.3604C48.7918 105.764 49.1175 109.284 46.7275 109.729L13.4248 115.938C9.28355 118.956 4.78331 121.512 0 123.528V105.646C14.9673 96.7583 25 80.4333 25 61.7637C25 43.0937 14.9676 26.7671 0 17.8799V0Z" fill="currentColor" />
        <path d="M69 101.123H38C38 101.123 48 82.623 48 62.123C48 41.623 38 23.123 38 23.123H69V101.123Z" fill="currentColor" />
      </svg>
      <span className="bg-ink px-3 py-1 !rounded-r-md flex items-center">
        <span className="block font-serif uppercase tracking-[-0.02em] leading-none font-bold text-white [-webkit-text-stroke:0.5px_currentColor]">
          unpolished
        </span>
      </span>
    </span>
  );
}
