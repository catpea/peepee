import { Plugin } from 'plugin';

import { take } from 'utils';
import { Signal } from 'signals';
// import { PersistentMap } from "./PersistentMap.js";

export class MenuPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.menuColumns = 2;
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;

    this.databasePlugin = app.plugins.get("DatabasePlugin");

    this.uiContainerElement = document.querySelector("#ui-container > .start-side");
    const htmlContent = `
      <div class="menu rounded shadow mb-3" tabindex="-1">
        <div id="menu-items" class="menubox-body">

          <div class="row">
            <div class="col">
              <button class="btn btn-sm bi bi-arrows-fullscreen" id="action-fullscreen"><i></i></button>
            </div>
            <div class="col">
              <button class="btn btn-sm bi bi-folder" id="action-file-open"><i></i></button>
            </div>
            <div class="col">
              <button class="btn btn-sm bi bi-floppy" id="action-file-save"><i></i></button>
            </div>
          </div>
        </div>
      </div>
    `;

    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.menuListElement = divElement.querySelector("#menu-items");

    this.actionOpenFile = divElement.querySelector("#action-file-open");
    this.actionOpenFile.addEventListener("click", () => { this.databasePlugin.fileOpen(); });

    this.actionOpenFile = divElement.querySelector("#action-file-save");
    this.actionOpenFile.addEventListener("click", () => { this.databasePlugin.fileSave(); });


    this.app.on("registerAction", ({ name: menuName, data: menuData }) => {
      const id = menuData.id;
      this.app.actions[menuName] = menuData;
      // this.renderItems();
    });

    this.app.on("selectMenu", (menuId) => {
      //console.log("selectMenu", menuId);
      if (!this.app.actions[menuId]) return console.error("No such menu", menuId);
      const dataMenuIdentity = this.app.actions[menuId].id;
      this.svg.setAttribute("data-menu", dataMenuIdentity);
    });

    this.app.emit("registerAction", { name: "select", data: { id: "select-menu", icon: "bi-cursor", iconSelected: "bi-cursor-fill", description: "select item" } });
    this.app.emit("registerAction", { name: "group", data: { id: "group-menu", icon: "bi-pentagon", iconSelected: "bi-pentagon-fill", description: "group items" } });
    // this.app.emit("registerMenu", { name: "group2", data: { id: "group-menu", icon: "bi-wrench", iconSelected: "bi-wrench-fill", description: "group items" } });

    // this.app.emit('registerMenu', {name:'interact', data:{id:'interact-menu', icon:'bi-hand-index-thumb', iconSelected:'bi-hand-index-fill', description:'interact with item' }});
    // this.app.emit('registerMenu', {name:'comment',  data:{id:'interact-menu', icon:'bi-pin-angle', iconSelected:'bi-pin-fill', description:'comment menu' }});

    ///...
    // this.app.emit('registerMenu', {name:'zoomIn',  data:{id:'zoom-in-menu'}});
    // this.app.emit('registerMenu', {name:'zoomOut', data:{id:'zoom-out-menu'}});

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }



  renderItems() {
    // clear menubox
    this.menuListElement.replaceChildren();

    for (const menusList of take(Object.entries(this.app.actions), this.menuColumns)) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (const [name, data] of menusList) {
        const col = document.createElement("div");
        col.classList.add("col");
        // col.style.textAlign = "center";
        const menuElement = this.renderItem(name, data);
        col.appendChild(menuElement);
        row.appendChild(col);
      }
      this.menuListElement.appendChild(row);
    }
  } // renderMenus

  renderItem(menuName, menuData) {
    const menuButton = document.createElement("button");
    menuButton.classList.add("btn", "btn-sm");
    menuButton.setAttribute("title", menuData.description);
    menuButton.addEventListener("click", () => this.eventDispatch("selectMenu", menuName));

    const menuIcon = document.createElement("i");
    menuButton.classList.add("bi", menuData.icon);




    menuButton.appendChild(menuIcon);

    return menuButton;
  }
} // class
