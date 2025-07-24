
export function installShowOpenFilePicker(){
  if (!window.showOpenFilePicker) {
    window.showOpenFilePicker = async function ({
      multiple = false,
      types = [],
      excludeAcceptAllOption = false,
    } = {}) {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        globalThis.input = input;
        input.type = "file";
        input.multiple = multiple;


        // Build accept attribute from `types` descriptor
        if (types.length > 0 && !excludeAcceptAllOption) {
          const acceptList = [];
          for (const type of types) {
            for (const extList of Object.values(type.accept)) {
              acceptList.push(...extList);
            }
          }
          input.accept = acceptList.join(",");
        }

        //input.style.display = "none";
        document.body.appendChild(input);

        input.addEventListener("change", () => {
          const files = Array.from(input.files);
          document.body.removeChild(input);

          const fileHandles = files.map((file) => ({
            kind: "file",
            name: file.name,
            getFile: async () => file,
          }));

          resolve(multiple ? fileHandles : [fileHandles[0]]);
        });


          input.click();


      });
    };
  }

}
