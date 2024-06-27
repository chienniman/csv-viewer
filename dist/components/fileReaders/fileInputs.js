(() => {
  // helpers/mergeStyleString.js
  function mergeStyleString(fixedStyles, styles) {
    const mergedStyles = { ...fixedStyles, ...styles };
    return Object.keys(mergedStyles).map((key) => `${key}: ${mergedStyles[key]};`).join(" ");
  }

  // components/shared/fileInput.js
  function fileInput({ id, text, styles }) {
    const styleString = mergeStyleString([], styles);
    return `
          <div class="file-input">
              <input type="file" name="${id}" id="${id}" class="file-input-input">
              <label class="file-input-label" for="${id}" style="${styleString}">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="upload" class="svg-inline--fa fa-upload fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                    </svg>
                  <span>${text}</span>
              </label>
          </div>
      `;
  }

  // utils/dataProcessing.js
  function processData(worksheet) {
    var dataArray = [];
    for (var row = 22; row <= 36; row++) {
      var rowObject = {};
      for (var col = 2; col <= 7; col++) {
        var cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        var cell = worksheet[cellAddress];
        rowObject[XLSX.utils.encode_col(col)] = cell ? cell.v : null;
      }
      dataArray.push(rowObject);
    }
    return dataArray;
  }
  function setData(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  // components/fileReaders/fileInputs.js
  $(document).ready(function() {
    function createBaseElement() {
      $("#uploadedFiles").append(`
      <div id="monthStocksFileNameDisplay"></div>
      <div id="todaySellsFileNameDisplay"></div>
      <div id="dailyKpiFileNameDisplay"></div>
    `);
      $(".top-row").append(
        fileInput({
          id: "monthStocks",
          text: "\u5EAB\u5B58",
          styles: {
            background: "#02723b"
          }
        }),
        fileInput({
          id: "todaySells",
          text: "\u65E5\u92B7",
          styles: {
            background: "#02723b"
          }
        }),
        fileInput({
          id: "dailyKpi",
          text: "\u7E3E\u6548",
          styles: {
            background: "#02723b"
          }
        })
      );
    }
    createBaseElement();
    $("#monthStocks").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $("#monthStocksFileNameDisplay").text("\u9032\u92B7\u5B58 : " + fileName);
    });
    $("#todaySells").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $("#todaySellsFileNameDisplay").text("\u55AE\u65E5\u92B7\u8CA8 : " + fileName);
    });
    $("#dailyKpi").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $("#dailyKpiFileNameDisplay").text("\u6BCF\u65E5\u696D\u7E3E : " + fileName);
      var file = this.files[0];
      var reader = new FileReader();
      new Promise((resolve, reject) => {
        reader.onload = function(e) {
          try {
            var data = e.target.result;
            var cfb = XLSX.read(data, { type: "binary" });
            var summaryData = processData(cfb.Sheets["\u7E3D\u8868"]);
            console.log(summaryData);
            setData("summaryData", summaryData);
            var oJS = XLSX.utils.sheet_to_json(cfb.Sheets["\u7C21\u96EF\u6A3A"]);
            setData("ojs", oJS);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = function(e) {
          reject(e);
        };
        reader.readAsBinaryString(file);
      }).then(() => {
        console.log("\u7E3E\u6548\u7E3D\u8868\u6210\u529F\u4E0A\u50B3");
      }).catch((error) => {
        console.error("\u7E3E\u6548\u7E3D\u8868\u4E0A\u50B3\u5931\u6557", error);
      });
    });
  });
})();