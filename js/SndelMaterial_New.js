class Material {
  static initialize() {
    this.initDrawerNav();
    this.initButtons();
    this.initRipple();
    this.initInputs();
    this.initSnackBar();
    this.initTabsBars();
    this.initList();
    // finish
    this.finishInitialize();
  }
  /* format */
  static finishInitialize() {
    document.body.style.opacity = 1;
  }
  static nodes2Array(nodes) {
    return Array.prototype.slice.call(nodes);
  }
  static getElementColorTheme(ele) {
    let themes = ["primary", "accent", "light", "dark"];
    return themes.find(theme => ele.getAttribute(theme) != null);
  }
  /* get content */
  static getContent() {
    return document.getElementsByTagName("content")[0];
  }
  /* loading */
  static createCircularLoading(options) {
    if (!options) return;
    let loading = document.createElement("loading");
    loading.className = "circular";
    loading.style.width = options.width + 8 + "px";
    loading.style.height = options.height + 8 + "px";
    loading.style.left = options.left - 4 + "px";
    loading.style.top = options.top - 4 + "px";
    loading.setAttribute(options.colorTheme, "");
    loading.innerHTML = `<loading-circle-layout>
                            <loading-layout-left>
                              <loading-circle-left></loading-circle-left>
                            </loading-layout-left>
                            <loading-layout-right>
                              <loading-circle-right></loading-circle-right>
                            </loading-layout-right>
                          </loading-circle-layout>`;
    return loading;
  }
  /* button */
  static getButtons() {
    return this.nodes2Array(document.getElementsByTagName("button"));
  }
  static initButtons() {
    this.getButtons().forEach(button => {
      button.append(document.createElement("shade"));
      /* init loading */
      let className = button.className;
      let loading;
      button.loading = () => {
        if (button.getAttribute("loading") != null || loading) return;
        button.setAttribute("loading", "");
        let options;
        if (this.isIconButton(button)) {
          button.setAttribute("disabled", "");
          button.className = "icon";
        }
        if (this.isIconButton(button) || this.isFABButton(button))
          options = {
            width: button.offsetWidth,
            height: button.offsetHeight,
            left: button.offsetLeft,
            top: button.offsetTop,
            colorTheme: this.getElementColorTheme(button)
          };
        loading = this.createCircularLoading(options);
        document.body.append(loading);
      };
      button.loaded = () => {
        button.removeAttribute("disabled");
        button.removeAttribute("loading");
        if (this.isIconButton(button)) {
          button.className = className;
        } else if (this.isFABButton(button)) {
        }
        loading && loading.remove && loading.remove();
      };
      /* init fab */
      if (this.isFABButton(button)) {
        button.hide = () => {
          this.hideFAB(button);
        };
        button.show = () => {
          this.showFAB(button);
        };
        button.icon = iconName => {
          let icon = this.nodes2Array(button.children).find(node =>
            node.className.split(" ").includes("icon")
          );
          iconName =
            iconName ||
            icon.className
              .split(" ")
              .filter(className => className != "icon")
              .join(" ");
          icon.className = `icon ${iconName}`;
        };
        button.colorTheme = colorTheme => {
          let nowTheme = this.getElementColorTheme(button);
          if (!colorTheme) return nowTheme;
          button.removeAttribute(nowTheme);
          button.setAttribute(colorTheme, "");
        };
      }
    });
  }
  static isIconButton(button) {
    return button.className.split(" ").includes("icon");
  }
  static isFABButton(button) {
    return button.className.split(" ").includes("fab");
  }
  static buttonLoading(button, colorTheme) {}
  static buttonLoaded(button, className) {
    button.removeAttribute("disabled");
    button.removeAttribute("loading");
    if (this.isIconButton(button)) {
      button.className = className;
      this.nodes2Array(button.childNodes).forEach(node => {
        if (node.tagName == "LOADING") node.remove();
      });
    } else if (this.isFABButton(button)) {
      this.nodes2Array(button.childNodes).forEach(node => {
        if (node.tagName == "LOADING") node.remove();
      });
    }
  }
  static hideFAB(button) {
    if (!button.className.split(" ").includes("fab"))
      return console.warn(`${button} is not a FAB which can not be hidden.`);
    button.setAttribute("hidden", "");
  }
  static showFAB(button) {
    button.removeAttribute("hidden");
  }
  /* ripple */
  static createRipple(fatherNode) {
    let ripple = document.createElement("ripple");
    let rippleSize = Math.max(fatherNode.clientWidth, fatherNode.clientHeight);
    ripple.style.width = ripple.style.height = rippleSize * 2 + "px";
    ripple.addEventListener("animationend", () => {
      ripple.className = "";
    });
    return ripple;
  }
  static initRipple() {
    let needRippleNodes = this.getButtons().concat(this.getTabs());
    needRippleNodes.forEach(fatherNode => {
      let childNodes = this.nodes2Array(fatherNode.childNodes);
      if (!childNodes.includes(child => child.tagName == "ripple")) {
        let ripple = this.createRipple(fatherNode);
        fatherNode.append(ripple);
        fatherNode.addEventListener("click", e =>
          this.rippleBlooming(e, ripple)
        );
      }
    });
  }
  static rippleBlooming(event, ripple) {
    ripple.style.left = event.offsetX - ripple.offsetWidth / 2 + "px";
    ripple.style.top = event.offsetY - ripple.offsetHeight / 2 + "px";
    ripple.className = "blooming";
  }
  /* input */
  static getInputs() {
    return this.nodes2Array(document.getElementsByTagName("input"));
  }
  static createInputContainer() {
    let inputContainer = document.createElement("div");
    inputContainer.className = "text-field";
    return inputContainer;
  }
  static createInputLabel(label) {
    let inputLabel = document.createElement("label");
    inputLabel.innerHTML = label;
    return inputLabel;
  }
  static createInputMessage(helpText) {
    let inputMessage = document.createElement("message");
    inputMessage.innerHTML = helpText;
    return inputMessage;
  }
  static initInputs() {
    this.getInputs().forEach(input => {
      let inputContainer = this.createInputContainer();
      input.parentNode.append(inputContainer);
      inputContainer.append(input);
      inputContainer.append(this.createInputLabel(input.getAttribute("label")));
      let inputMessage = this.createInputMessage(
        input.getAttribute("help-text")
      );
      inputContainer.append(inputMessage);
      input.addEventListener("focus", () => {
        input.setAttribute("visited", "");
        input.onvalid();
      });
      input.onvalid = () => {
        inputMessage.className = "";
        inputMessage.innerHTML =
          input.getAttribute("help-text") || input.getAttribute("sucmsg") || "";
      };
      input.oninvalid = () => {
        inputMessage.className = "error";
        inputMessage.innerHTML =
          input.getAttribute("errormsg") ||
          `${input.getAttribute("label")}格式不正确`;
      };
      input.addEventListener("blur", () => {
        if (!input.validity.valid) input.oninvalid();
      });
    });
  }
  /* snackbar */
  static getSnackBar() {
    return document.getElementsByTagName("snack-bar")[0];
  }
  static clearSnackBar() {
    this.nodes2Array(document.getElementsByTagName("snack-bar")).forEach(node =>
      node.remove()
    );
  }
  static getSnackBarContents() {
    return document.getElementsByTagName("snack-bar-content")[0];
  }
  static initSnackBar() {
    this.clearSnackBar();
    let snackBar = document.createElement("snack-bar");
    snackBar.innerHTML =
      "<snack-bar-content></snack-bar-content><snack-bar-actions></snack-bar-actions>";
    this.getContent().append(snackBar);
  }
  static callSnackBar(body, action1, action2) {
    this.getSnackBarContents().innerHTML = body;
    this.getSnackBar().setAttribute("state", "on");
    setTimeout(() => this.hideSnackBar(), 2000);
  }
  static hideSnackBar() {
    this.getSnackBar().setAttribute("state", "off");
  }
  /* tabs bar */
  static getTabsBars() {
    return this.nodes2Array(document.getElementsByTagName("tabs-bar"));
  }
  static getTabs() {
    return this.nodes2Array(document.getElementsByTagName("tab"));
  }
  static initTabsBars() {
    this.getTabsBars().forEach(tabsBar => {
      if (tabsBar.getAttribute("panels-collection-id")) {
        // get vars
        let tabSlectedLine = document.createElement("tab-slected-line");
        tabsBar.append(tabSlectedLine);
        let tabs = this.nodes2Array(tabsBar.childNodes).filter(
          node => node.tagName == "TAB"
        );
        let tabsPanelsCollection = document.getElementById(
          tabsBar.getAttribute("panels-collection-id")
        );
        let tabsPanels = this.nodes2Array(
          tabsPanelsCollection.childNodes
        ).filter(node => node.tagName == "TAB-PANEL");

        // tab panel
        tabsPanels.forEach(panel => {
          panel.active = () => {
            panel.className = "active";
            let activeIdx = tabsPanels.indexOf(panel);
            tabsPanels.forEach((otherPanel, idx) => {
              if (idx < activeIdx) otherPanel.className = "left hide";
              else if (idx > activeIdx) otherPanel.className = "right hide";
            });
          };
          let scrollTimer;
          panel.onscroll = () => {
            TOUCH_STATES_X = null;
            clearTimeout(scrollTimer);
            tabsPanelsCollection.ontouchstart = null;
            tabsPanelsCollection.ontouchmove = null;
            tabsPanelsCollection.ontouchend = null;
            scrollTimer = setTimeout(() => {
              tabsPanelsCollection.ontouchstart = handlePanelsTouchStart;
              tabsPanelsCollection.ontouchmove = handlePanelsTouchMove;
              tabsPanelsCollection.ontouchend = handlePanelsTouchEnd;
            }, 250);
          };
        });

        // tabs panel collection
        let TOUCH_STATES_X = null;
        let handlePanelsTouchStart = e => {
          tabsPanelsCollection.setAttribute("gesture", "");
          TOUCH_STATES_X = e.touches[0].screenX;
        };
        let handlePanelsTouchEnd = e => {
          tabsPanelsCollection.removeAttribute("gesture");
          let deltaX = TOUCH_STATES_X - e.changedTouches[0].screenX;
          let activeIdx = tabs.findIndex(tab => tab.className == "active");
          let towardIdx;
          if (Math.abs(deltaX) > tabsPanelsCollection.offsetWidth / 2) {
            if (
              !(Math.sign(deltaX) > 0 && activeIdx == tabsPanels.length - 1) &&
              !(Math.sign(deltaX) < 0 && activeIdx == 0)
            ) {
              towardIdx = Math.min(
                Math.max(0, activeIdx + Math.sign(deltaX)),
                tabsPanels.length - 1
              );
              tabsBar.selectTab(towardIdx);
            }
          }
          tabsPanels.forEach((panel, idx) => {
            panel.removeAttribute("style");
          });
          TOUCH_STATES_Y = null;
          TOUCH_STATES_X = null;
        };
        let TOUCH_STATES_Y = null;
        let handlePanelsTouchMove = e => {
          let deltaX = TOUCH_STATES_X - e.touches[0].screenX;
          if (
            TOUCH_STATES_Y &&
            Math.abs(e.touches[0].screenY - TOUCH_STATES_Y) > deltaX
          )
            return (TOUCH_STATES_Y = e.touches[0].screenY);
          TOUCH_STATES_Y = e.touches[0].screenY;
          tabsPanelsCollection.setAttribute("gesture", "");
          let activeIdx = tabs.findIndex(tab => tab.className == "active");
          if (Math.sign(deltaX) > 0 && activeIdx == tabsPanels.length - 1)
            return;
          if (Math.sign(deltaX) < 0 && activeIdx == 0) return;
          let towardIdx = Math.min(
            Math.max(0, activeIdx + Math.sign(deltaX)),
            tabsPanels.length - 1
          );
          tabsPanels[activeIdx].style.transform = `translateX(${-deltaX}px)`;
          tabsPanels[activeIdx].style.opacity =
            1 - 1 * Math.abs(deltaX) / tabsPanelsCollection.offsetWidth;
          tabsPanels[towardIdx].style.transform = `translateX(${Math.sign(
            deltaX
          ) *
            tabsPanelsCollection.offsetWidth -
            deltaX}px)`;
          tabsPanels[towardIdx].style.opacity =
            1 * Math.abs(deltaX) / tabsPanelsCollection.offsetWidth;
        };
        tabsPanelsCollection.ontouchstart = handlePanelsTouchStart;
        tabsPanelsCollection.ontouchmove = handlePanelsTouchMove;
        tabsPanelsCollection.ontouchend = handlePanelsTouchEnd;

        // tabs bar
        tabsBar.selectTab = idx => {
          tabs.forEach(tab => (tab.className = ""));
          tabs[idx].className = "active";
          tabSlectedLine.style.left = tabs[idx].offsetLeft + "px";
          tabSlectedLine.style.width = tabs[idx].offsetWidth + "px";
          tabsPanels.forEach(panel => (panel.className = ""));
          tabsPanels[idx].active();
        };
        tabsBar.selectTab(0);
        // tabs
        tabs.forEach((tab, idx) => {
          tab.addEventListener("click", () => {
            tabsBar.selectTab(idx);
          });
        });
      } else tabsBar.remove();
    });
  }
  /* mask */
  static callMask(onclick, additionClassName) {
    let mask = document.createElement("mask");
    document.body.append(mask);
    mask.setAttribute("state", "on");
    mask.className = additionClassName || "";
    mask.onclick = () => {
      mask.setAttribute("state", "off");
      onclick && onclick();
      mask.addEventListener("transitionend", () => {
        mask.remove();
      });
    };
    return mask;
  }
  static hideMask() {
    let masks = getElementsByTagName("mask");
    masks.forEach(mask => mask.remove());
  }
  /* drawer nav */
  static getDrawerNav() {
    return getElementsByTagName("drawer-nav")[0];
  }
  static getDrawerNavHeader() {
    return getElementsByTagName("drawer-nav-header")[0];
  }
  static initDrawerNav() {
    let drawerNav = this.getDrawerNav();
    if (drawerNav) drawerNav.masks = [];
    let nodesExceptDrawer = document.body
      .childrenArray()
      .filter(node => node.tagName != "DRAWER-NAV");
    let container = document.createElement("main-viewport");
    nodesExceptDrawer.forEach(node => container.append(node));
    document.body.append(container);
    let getDrawerNavHeader = this.getDrawerNavHeader();
    if (getDrawerNavHeader) {
      getDrawerNavHeader.style.backgroundImage = getDrawerNavHeader.getAttribute(
        "bg-img"
      );
      getDrawerNavHeader.style.backgroundColor = getDrawerNavHeader.getAttribute(
        "bg-color"
      );
    }
  }
  static callMenu() {
    let drawerNav = this.getDrawerNav();
    drawerNav.setAttribute("state", "on");
    let formal = window.innerWidth > 1024 ? "formal" : "";
    drawerNav.masks.push(this.callMask(() => this.collapseMenu(), formal));
  }
  static collapseMenu() {
    let drawerNav = this.getDrawerNav();
    drawerNav.setAttribute("state", "off");
    drawerNav.masks.forEach(mask => mask.click());
  }
  static toggleMenu() {
    let drawerNav = this.getDrawerNav();
    if (drawerNav.getAttribute("state") == "on") this.collapseMenu();
    else this.callMenu();
  }
  /* list */
  static getLists() {
    return this.nodes2Array(document.getElementsByTagName("list"));
  }
  static initList() {
    this.getLists().forEach(list => {
      let oriWidth = list.clientWidth;
      let oriHeight = list.clientHeight;
      let callBy = document.getElementById(list.getAttribute("call-by-id"));
      if (!callBy) return list.remove();

      // operator
      list.hide = () => {
        list.setAttribute("state", "off");
        list.style.maxWidth = callBy.offsetWidth + "px";
        list.style.maxHeight = callBy.offsetHeight + "px";
      };

      list.call = () => {
        list.setAttribute("state", "on");
        list.style.maxWidth = oriWidth + "px";
        list.style.maxHeight = oriHeight + "px";
        this.callMask(list.hide, "transparent");
      };

      // reposition on callBy
      if (list.clientWidth > window.innerWidth - callBy.offsetLeft)
        list.style.right =
          window.innerWidth - (callBy.offsetLeft + callBy.offsetWidth) + "px";
      else list.style.left = callBy.offsetLeft + "px";
      if (list.clientHeight > window.innerHeight - callBy.offsetTop)
        list.style.bottom =
          window.innerHeight - (callBy.offsetTop + callBy.offsetHeight) + "px";
      else list.style.top = callBy.offsetTop + "px";

      list.hide();
    });
  }
}
window.onload = () => {
  Material.initialize();
};
createElement = function(tagName) {
  return document.createElement(tagName);
};
getElementById = id => {
  return document.getElementById(id);
};
getElementsByTagName = tag => {
  return Array.prototype.slice.call(document.getElementsByTagName(tag));
};
getElementsByClassName = className => {
  return Array.prototype.slice.call(document.getElementsByClassName(className));
};
HTMLElement.prototype.childrenArray = function() {
  return Array.prototype.slice.call(this.children);
};
HTMLElement.prototype.findByClassName = function(className) {
  return this.childrenArray()
    .filter(child => child.className.split(" ").includes(className))
    .concat(
      ...this.childrenArray().map(child => child.findByClassName(className))
    );
};
HTMLElement.prototype.findByTagName = function(tag) {
  return this.childrenArray()
    .filter(child => child.tagName == tag.toUpperCase())
    .concat(...this.childrenArray().map(child => child.findByTagName(tag)));
};
HTMLElement.prototype.documentTop = function() {
  let offsetTop = ele => {
    return ele.offsetTop + (ele.offsetParent ? offsetTop(ele.offsetParent) : 0);
  };
  return offsetTop(this)
};
HTMLElement.prototype.documentLeft = function() {
  let offsetLeft= ele => {
    return ele.offsetLeft + (ele.offsetParent ? offsetLeft(ele.offsetParent) : 0);
  }
  return offsetLeft(this);
};
