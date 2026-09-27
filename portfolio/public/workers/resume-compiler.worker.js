/* global exports */
importScripts("/vendor/swiftlatex/PdfTeXEngine.js");

let engine;

async function getEngine() {
  if (engine?.isReady()) return engine;
  engine = new exports.PdfTeXEngine();
  await engine.loadEngine();
  engine.latexWorker.postMessage({
    cmd: "settexliveurl",
    url: `${self.location.origin}/vendor/swiftlatex/texlive/`,
  });
  return engine;
}

self.onmessage = async (event) => {
  if (event.data?.type !== "compile") return;
  const { requestId } = event.data;
  try {
    const compiler = await getEngine();
    compiler.writeMemFSFile("main.tex", event.data.source);
    compiler.setEngineMainFile("main.tex");
    const result = await compiler.compileLaTeX();
    if (!result.pdf || result.status !== 0) {
      self.postMessage({ type: "error", requestId, log: result.log || "LaTeX compilation failed." });
      return;
    }
    const pdf = result.pdf.buffer;
    const logPageCount = result.log?.match(/Output written on .+ \((\d+) pages?[,)]/i);
    const pdfText = new TextDecoder("latin1").decode(result.pdf);
    const pageCount = Number(logPageCount?.[1]) || (pdfText.match(/\/Type\s*\/Page\b/g) || []).length || 1;
    self.postMessage({ type: "success", requestId, pdf, pageCount, log: result.log || "" }, [pdf]);
  } catch (error) {
    self.postMessage({ type: "error", requestId, log: error?.message || "Unable to start the browser LaTeX engine." });
  }
};
