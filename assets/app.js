/* QR Code Generator — front-end logic.
 *
 * Reads the form, builds a QR model with the vendored qrcode-generator library
 * (global `qrcode`), renders it to a <canvas>, and exports PNG/SVG. Everything
 * runs locally in the browser; no network calls are made.
 */
(function () {
  "use strict";

  var el = {};
  var current = null;          // last successfully built QR model, or null
  var debounceTimer = null;    // pending debounced render, so exports can flush it
  var copyResetTimer = null;   // pending "Copied!" -> label reset
  var COPY_LABEL = "Copy image";

  function byId(id) { return document.getElementById(id); }

  // Run any pending debounced render synchronously so `current` (the model) and the live inputs
  // agree before an export/copy. Without this, a click within the debounce window would export the
  // previously-rendered model while naming the file from the newer input (content/name mismatch).
  function flushRender() {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    render();
  }

  // Smallest square that shows the code crisply in the preview.
  var PREVIEW_TARGET_PX = 320;

  function clampInt(value, min, max, fallback) {
    var n = parseInt(value, 10);
    if (isNaN(n)) { return fallback; }
    if (n < min) { return min; }
    if (n > max) { return max; }
    return n;
  }

  function readOptions() {
    var margin = parseInt(el.margin.value, 10);
    if (isNaN(margin) || margin < 0) { margin = 0; }
    if (margin > 16) { margin = 16; }
    var custom = el.size.value === "custom";
    return {
      text: el.text.value,
      ecl: el.ecl.value,
      margin: margin,
      fg: el.fg.value,
      bg: el.bg.value,
      transparent: el.transparent.checked,
      custom: custom,
      size: custom ? 0 : (parseInt(el.size.value, 10) || 1024),
      width: clampInt(el.customW.value, 16, 4096, 1024),
      height: clampInt(el.customH.value, 16, 4096, 1024)
    };
  }

  // Build a QR model. typeNumber 0 auto-selects the smallest version that fits.
  // Throws when the data is too large even for version 40 at the chosen level.
  function buildModel(text, ecl) {
    var qr = qrcode(0, ecl);
    qr.addData(text);
    qr.make();
    return qr;
  }

  function versionFromCount(count) { return (count - 17) / 4; }

  // Paint the QR's dark modules onto a 2D context, each module `moduleSize` px, offset by (ox, oy).
  function paintModules(ctx, qr, opts, moduleSize, ox, oy) {
    var count = qr.getModuleCount();
    ctx.fillStyle = opts.fg;
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(
            ox + (c + opts.margin) * moduleSize,
            oy + (r + opts.margin) * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  // Draw the QR as a tight square (canvas sized to the modules) at a given module pixel size.
  function drawToCanvas(canvas, qr, opts, moduleSize) {
    var dim = (qr.getModuleCount() + opts.margin * 2) * moduleSize;
    canvas.width = dim;
    canvas.height = dim;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, dim, dim);
    if (!opts.transparent) {
      ctx.fillStyle = opts.bg;
      ctx.fillRect(0, 0, dim, dim);
    }
    paintModules(ctx, qr, opts, moduleSize, 0, 0);
  }

  // Build a compact, crisp SVG string (dark modules merged into horizontal runs).
  function buildSVG(qr, opts) {
    var count = qr.getModuleCount();
    var total = count + opts.margin * 2;
    var scale = 10; // px per module in the exported file
    var d = "";
    for (var r = 0; r < count; r++) {
      var c = 0;
      while (c < count) {
        if (qr.isDark(r, c)) {
          var start = c;
          while (c < count && qr.isDark(r, c)) { c++; }
          var len = c - start;
          d += "M" + (start + opts.margin) + " " + (r + opts.margin) +
               "h" + len + "v1h-" + len + "z";
        } else {
          c++;
        }
      }
    }
    var px = total * scale;
    var bgRect = opts.transparent
      ? ""
      : '<rect width="' + total + '" height="' + total + '" fill="' + opts.bg + '"/>';
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + px + '" height="' + px + '" ' +
      'viewBox="0 0 ' + total + ' ' + total + '" shape-rendering="crispEdges">' +
      bgRect +
      '<path fill="' + opts.fg + '" d="' + d + '"/>' +
      "</svg>\n";
  }

  // Mirror the CLI script's sanitize_filename so downloads get comparable names.
  function fileBase(text) {
    var name = (text || "").replace(/[\\/*?:"<>|]/g, "").trim();
    name = name.replace(/\s+/g, "-").slice(0, 60);
    return name || "qr-code";
  }

  function setStatus(msg, isError) {
    el.status.textContent = msg;
    el.status.classList.toggle("error", !!isError);
  }

  function setEnabled(on) {
    el.dlPng.disabled = !on;
    el.dlSvg.disabled = !on;
    el.copy.disabled = !on || !supportsCopy();
  }

  function supportsCopy() {
    return typeof ClipboardItem !== "undefined" &&
      navigator.clipboard && typeof navigator.clipboard.write === "function";
  }

  function render() {
    var opts = readOptions();
    if (!opts.text) {
      current = null;
      clearPreview(opts);
      setStatus("Enter a URL or text to generate a QR code.", false);
      el.caption.textContent = "";
      setEnabled(false);
      return;
    }
    var qr;
    try {
      qr = buildModel(opts.text, opts.ecl);
    } catch (e) {
      current = null;
      clearPreview(opts);
      setStatus("That's too much data for one QR code. Shorten the text, or lower the error-correction level.", true);
      el.caption.textContent = "";
      setEnabled(false);
      return;
    }
    current = qr;
    var count = qr.getModuleCount();
    var moduleSize = Math.max(2, Math.floor(PREVIEW_TARGET_PX / (count + opts.margin * 2)));
    drawToCanvas(el.canvas, qr, opts, moduleSize);
    el.canvas.setAttribute("aria-label", "QR code for: " + opts.text.slice(0, 120));
    setStatus("", false);
    el.caption.textContent =
      count + "×" + count + " modules · version " + versionFromCount(count) +
      " · EC level " + opts.ecl;
    setEnabled(true);
  }

  function clearPreview(opts) {
    var canvas = el.canvas;
    canvas.width = 300;
    canvas.height = 300;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Render the current model at the chosen export size onto an offscreen canvas.
  // Used by BOTH the PNG download and Copy image, so they always match the size setting.
  // - Preset (512/1024/2048): the largest pixel-perfect square that fits within the target.
  // - Custom W×H: a canvas of exactly that size, with the largest whole-module square centered
  //   in it (extra space filled with the background, or left transparent).
  function exportCanvas(opts) {
    var totalModules = current.getModuleCount() + opts.margin * 2;
    var canvas = document.createElement("canvas");

    if (!opts.custom) {
      var moduleSize = Math.max(1, Math.floor(opts.size / totalModules));
      drawToCanvas(canvas, current, opts, moduleSize);
      return canvas;
    }

    var ms = Math.max(1, Math.floor(Math.min(opts.width, opts.height) / totalModules));
    var qrDim = ms * totalModules;
    // Honor the requested pixels exactly, but never crop the code: if the request is smaller than
    // the smallest 1px-per-module rendering, grow the canvas so the QR still fits.
    var cw = Math.max(opts.width, qrDim);
    var ch = Math.max(opts.height, qrDim);
    canvas.width = cw;
    canvas.height = ch;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    if (!opts.transparent) {
      ctx.fillStyle = opts.bg;
      ctx.fillRect(0, 0, cw, ch);
    }
    paintModules(ctx, current, opts, ms, Math.floor((cw - qrDim) / 2), Math.floor((ch - qrDim) / 2));
    return canvas;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after the click has been handled.
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function onDownloadPng() {
    flushRender();
    if (!current) { return; }
    var opts = readOptions();
    var canvas = exportCanvas(opts);
    canvas.toBlob(function (blob) {
      if (blob) { downloadBlob(blob, fileBase(opts.text) + ".png"); }
    }, "image/png");
  }

  function onDownloadSvg() {
    flushRender();
    if (!current) { return; }
    var opts = readOptions();
    var svg = buildSVG(current, opts);
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), fileBase(opts.text) + ".svg");
  }

  function onCopy() {
    flushRender();
    if (!current || !supportsCopy()) { return; }
    var opts = readOptions();
    var canvas = exportCanvas(opts);
    canvas.toBlob(function (blob) {
      if (!blob) { return; }
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]).then(
        function () {
          // Restore to a fixed label (not the live textContent) and clear any prior reset, so a
          // second copy within the window can't capture "Copied!" and leave the button stuck.
          clearTimeout(copyResetTimer);
          el.copy.textContent = "Copied!";
          copyResetTimer = setTimeout(function () { el.copy.textContent = COPY_LABEL; }, 1400);
        },
        function () { setStatus("Couldn't copy to the clipboard — try downloading instead.", true); }
      );
    }, "image/png");
  }

  function init() {
    el = {
      text: byId("text"),
      ecl: byId("ecl"),
      margin: byId("margin"),
      fg: byId("fg"),
      bg: byId("bg"),
      transparent: byId("transparent"),
      size: byId("size"),
      customBlock: byId("custom-size"),
      customW: byId("custom-w"),
      customH: byId("custom-h"),
      canvas: byId("canvas"),
      status: byId("status"),
      caption: byId("caption"),
      dlPng: byId("dl-png"),
      dlSvg: byId("dl-svg"),
      copy: byId("copy")
    };

    if (typeof qrcode !== "function") {
      setStatus("The QR library failed to load. Reload the page to try again.", true);
      return;
    }

    function schedule() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 120);
    }

    // Show the width/height inputs only when "Custom…" is selected.
    function updateCustomVisibility() {
      el.customBlock.classList.toggle("hidden", el.size.value !== "custom");
    }

    el.text.addEventListener("input", schedule);
    el.ecl.addEventListener("change", render);
    el.size.addEventListener("change", updateCustomVisibility);
    el.margin.addEventListener("input", schedule);
    el.fg.addEventListener("input", schedule);
    el.bg.addEventListener("input", schedule);
    el.transparent.addEventListener("change", render);

    el.dlPng.addEventListener("click", onDownloadPng);
    el.dlSvg.addEventListener("click", onDownloadSvg);
    el.copy.addEventListener("click", onCopy);

    if (!supportsCopy()) {
      el.copy.title = "Clipboard image copy isn't supported in this browser";
    }

    updateCustomVisibility();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
