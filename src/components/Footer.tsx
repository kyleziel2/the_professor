export const Footer = () => {
  return (
    <footer className="flex justify-center">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <p className="text-[#6a7981] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
          Powered by Revi Agency
        </p>
        <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
          <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
            <a
              className="text-[#6a7981] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-[#6a7981] text-base font-normal leading-normal min-w-40"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <p className="text-[#6a7981] text-base font-normal leading-normal">
            © 2025 Ziel. All rights reserved.
          </p>
        </footer>
      </div>
    </footer>
  );
};
