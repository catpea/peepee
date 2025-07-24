/*

  async function saveJsonFile(jsonString, fileName = "data.json") {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "JSON File",
          accept: { "application/json": [".json"] },
        },
      ],
    });

    const writable = await fileHandle.createWritable();
    await writable.write(jsonString);
    await writable.close();
  }


*/

export function installShowSaveFilePicker(){

  if (!window.showSaveFilePicker) {
  window.showSaveFilePicker = async function ({
    suggestedName = "download.txt",
    types = [],
  } = {}) {
    return {
      async createWritable() {
        const chunks = [];

        return {
          async write(data) {
            if (
              typeof data === "string" ||
              data instanceof Blob ||
              data instanceof Uint8Array
            ) {
              chunks.push(data);
            } else {
              throw new TypeError("Only strings, Blobs, or Uint8Arrays are supported.");
            }
          },

          async close() {
            const mimeType =
              types[0]?.accept && Object.keys(types[0].accept)[0]
                ? Object.keys(types[0].accept)[0]
                : "application/octet-stream";

            const blob = new Blob(chunks, { type: mimeType });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = suggestedName;
            a.style.display = "none";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          },
        };
      },
    };
  };
}

}
