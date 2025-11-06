/*
 * FileSaver.js
 * A saveAs() FileSaver implementation.
 *
 * By Eli Grey, http://eligrey.com
 *
 * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
 * source  : http://purl.eligrey.com/github/FileSaver.js
 */
export default function saveAs(blob, name) {
  var a = document.createElement("a");
  name = name || blob.name || "download";

  a.download = name;
  a.rel = "noopener";

  // Support blobs
  a.href = URL.createObjectURL(blob);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 4e4); // 40s
  setTimeout(function () {
    a.click();
  }, 0);
}
