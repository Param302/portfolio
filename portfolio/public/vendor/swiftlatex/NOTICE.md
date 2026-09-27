# SwiftLaTeX and TeX Live runtime notice

This directory contains the SwiftLaTeX PDFTeX WebAssembly runtime and a pinned, minimal TeX Live 2020 runtime subset used to compile the portfolio resume in the browser.

SwiftLaTeX engine sources and release artifacts are copyright Elliott Wen / SwiftLab and carry the license notices embedded in `PdfTeXEngine.js` and `swiftlatexpdftex.js`. Project source: <https://github.com/SwiftLaTeX/SwiftLaTeX>.

The TeX runtime files were taken from the TeX Live historic archives. Individual packages retain their original LPPL, SIL OFL, public-domain, or other upstream licenses and copyright notices. TeX Live licensing information: <https://tug.org/texlive/copying.html>.

The bundle is intentionally version-matched to the `swiftlatexpdftex.fmt` format and is served locally from `/vendor/swiftlatex/texlive/pdftex/`; the admin compiler does not call a third-party compilation API or package mirror.
