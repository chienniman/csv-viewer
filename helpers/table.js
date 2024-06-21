import { productMap } from "../dataSets/pxMarts.js";

function isTableEmpty(table) {
  return table.children().length === 0;
}

function showError(message) {
  Swal.fire({ title: message, icon: "error" });
}

function getFormattedDate() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return `${month}月_${day}日`;
}

function exportToExcel() {
  const htmlTable = $("#resultTable");

  if (isTableEmpty(htmlTable)) return showError("無法導出空表格!");

  const formattedDate = getFormattedDate();

  new Table2Excel().export(htmlTable, `PX台中日銷庫存表_${formattedDate}`);
}

function clearTableAndInput() {
  $("#fileNameDisplay, #resultTable").empty();
  $(
    "input[name=monthStocks], input[name=todaySells], input[name=dailyKpi]"
  ).val("");
  $(
    "#monthStocksFileNameDisplay, #todaySellsFileNameDisplay, #dailyKpiFileNameDisplay"
  ).text("");
}

function appendHeaderRows() {
  let headerRow = createHeaderRow();
  let subHeaderRow = createSubHeaderRow();

  $("#resultTable").append(headerRow);
  $("#resultTable").append(subHeaderRow);
}

function createHeaderRow() {
  let headerRow = "<tr class='gray'><th>處</th><th>區</th><th>店名</th>";

  Array.from(productMap.values()).forEach((product) => {
    headerRow += `<th colspan="2">${product}</th>`;
  });

  return headerRow + "</tr>";
}

function createSubHeaderRow() {
  let subHeaderRow = "<tr class='white'><th></th><th></th><th></th>";

  Array.from(productMap.values()).forEach(() => {
    subHeaderRow += `
            <th id="stock">
                <div class='darkred-text'>
                    庫存
                </div>
            </th>
            <th id="sell">
                <div class='darkred-text'>
                    日銷
                </div>
            </th>
        `;
  });

  return subHeaderRow + "</tr>";
}

function createTable(container, className, tableId) {
  return $("<table>", { class: className, id: tableId }).appendTo(container);
}

function createRow(table) {
  return $("<tr>").appendTo(table);
}

function createCell(rowElement, className, id) {
  var cell = $("<td>", {
    class: className,
    id: id,
  });
  cell.appendTo(rowElement);

  return cell;
}

function createTableWithRows(
  table,
  storesData,
  imagesData,
  startIndex,
  imagesPerRow
) {
  const tableRows = [];

  for (let j = 0; j < 2; j++) {
    const currentStoreRow = createRow(table);
    const currentImageRow = createRow(table);

    createCell(currentStoreRow, "empty-td", null);
    createCell(currentImageRow, "description-td", null).text("陳列位");

    const storesSlice = storesData.slice(
      startIndex + j * imagesPerRow,
      startIndex + (j + 1) * imagesPerRow
    );

    const { storeCells, imageCells } = populateRows(
      storesSlice,
      imagesData,
      currentStoreRow,
      currentImageRow
    );
    fillEmptyCells(
      currentStoreRow,
      currentImageRow,
      imagesPerRow - storesSlice.length
    );

    tableRows.push({
      storeCells: storeCells,
      imageCells: imageCells.filter((cell) => cell !== null),
    });

    if (storesData.length <= startIndex + (j + 1) * imagesPerRow) break;
  }

  return tableRows;
}

function addImageToCell(cellElement, base64data) {
  const imgElement = $("<img>")
    .attr("src", "data:image/png;base64," + base64data)
    .css({ width: "100%", height: "100%" });

  cellElement.empty().append(imgElement);
}

function populateRows(
  storesSlice,
  imagesData,
  currentStoreRow,
  currentImageRow
) {
  const storeCells = [];
  const imageCells = [];

  storesSlice.forEach((store) => {
    const base64data = imagesData.get(store.rowId) || null;
    const storeId = `store-${store.rowId}`;
    const imageId = `photo-${store.rowId}`;

    const storeCell = createCell(currentStoreRow, "store-td", storeId).text(
      store.store
    );
    storeCells.push(storeCell);

    if (base64data) {
      const imageCell = createCell(currentImageRow, "photo-td", imageId);
      addImageToCell(imageCell, base64data);
      imageCells.push(imageCell);
    } else {
      const emptyImageCell = createCell(
        currentImageRow,
        "photo-td",
        imageId
      ).text("無圖像");
      imageCells.push(emptyImageCell);
    }
  });

  return { storeCells, imageCells };
}

function fillEmptyCells(currentStoreRow, currentImageRow, cellsToAdd) {
  for (let k = 0; k < cellsToAdd; k++) {
    createCell(currentStoreRow, "store-td", null).text("無資料");
    createCell(currentImageRow, "photo-td", null).text("無圖像");
  }
}

export {
  exportToExcel,
  clearTableAndInput,
  appendHeaderRows,
  createTable,
  createTableWithRows,
};
