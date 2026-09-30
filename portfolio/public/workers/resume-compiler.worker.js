/* global exports */
importScripts("/vendor/swiftlatex/PdfTeXEngine.js");

let engine;
let pendingRequest;
let processing = false;

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

async function processQueue() {
  if (processing) return;
  processing = true;
  try {
    while (pendingRequest) {
      let request = pendingRequest;
      pendingRequest = undefined;
      try {
        const compiler = await getEngine();
        // Loading can take longer than an edit: compile the latest source next.
        if (pendingRequest) {
          request = pendingRequest;
          pendingRequest = undefined;
        }
        compiler.writeMemFSFile("main.tex", request.source);
        compiler.setEngineMainFile("main.tex");
        const result = await compiler.compileLaTeX();
        if (!result.pdf || result.status !== 0) {
          throw new Error(result.log || "LaTeX compilation failed.");
        }
        const pdf = result.pdf.buffer;
        const logPageCount = result.log?.match(/Output written on .+ \((\d+) pages?[,)]/i);
        const pdfText = new TextDecoder("latin1").decode(result.pdf);
        const pageCount = Number(logPageCount?.[1]) || (pdfText.match(/\/Type\s*\/Page\b/g) || []).length || 1;
        self.postMessage({ type: "success", requestId: request.requestId, pdf, pageCount, log: result.log || "" }, [pdf]);
      } catch (error) {
        const failedEngine = engine;
        engine = undefined;
        try {
          failedEngine?.closeWorker();
        } catch {
          // A stopped worker must not prevent later edits from retrying.
        }
        self.postMessage({ type: "error", requestId: request.requestId, log: error?.message || "Unable to start the browser LaTeX engine." });
      }
    }
  } finally {
    processing = false;
  }
}

self.onmessage = (event) => {
  if (event.data?.type !== "compile") return;
  pendingRequest = event.data;
  void processQueue();
};
