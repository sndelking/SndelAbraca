$(document).ready(initialize);
var appBar;
var tabsBar;
var tabPanelsContainer;
var tabPanels;
var lists;
var FAB;
function initialize() {
  appBar = $("#appBar");
  tabsBar = $("#tabsBar");
  tabPanelsContainer = $("#panels")
  tabPanels = $(".panel");
  lists = $(".list");
  FAB = $(".FAB");
  initAppBar();
  initAppBarAfter();
  initTabsBar();
  initTabPanels();
  initCards();
  initButtons();
  initLists();
  initInputs();
  initDrawerMenu();
  initDialogs();
  initSnackBar();
}
/*appBar*/
function initAppBar() {
  if (appBar.hasClass("flexible")) {
    appBar.append("<flexible-space></flexible-space>");
    initWindowScroll();
    $(window).scroll(initWindowScroll);
  }
}
function initAppBarAfter() {
  var offsetH = Math.min(appBar.height(), 128);
  $("#appBar+div:not(#panels)").css("margin-top", offsetH);
}
/*scroll*/
var lastScrollY = 0;
function initWindowScroll() {
  let flexibleSpace = appBar.find("flexible-space");
  let toolsBarH = appBar.find("toolsBar").height();
  let scrollY = window.scrollY;
  let originFlexH = screen.width * 3 / 4;
  let topFlexH = Math.min(originFlexH, 320) - toolsBarH;
  let maxScroll = 112 - toolsBarH;
  let scrollRate = topFlexH / maxScroll;
  let flexH = Math.max(topFlexH - scrollY * scrollRate, 0);
  flexibleSpace.height(flexH);
  if (flexH == 0) {
    $("#appBar").addClass("color");
    $("#appBar").removeClass("image");
    if ((scrollY - toolsBarH) * scrollRate > topFlexH + toolsBarH) {
      if (lastScrollY < scrollY) {
        $("#appBar").css("top", -toolsBarH);
      } else {
        $("#appBar").css("top", 0);
      }
    }
  } else {
    $("#appBar").addClass("image");
    $("#appBar").removeClass("color");
  }
  lastScrollY = scrollY;
}
/*tabBar*/
function initTabsBar() {
  if (!tabsBar.length) return;
  var activeLine;
  var tabs;
  initActiveLine();
  initTabs();
  refreshTabsBar();
  function initActiveLine() {
    tabsBar.append("<span activeId=0></span>");
    activeLine = tabsBar.find("span");
  }
  function initTabs() {
    tabs = tabsBar.find("tab");
    tabs.each(initTab);
    tabs.each(addTabClickEvents);
    tabs.each(addRipple);
  }
  function initTab(i) {
    $(this).attr("tabID", i);
  }
  function addTabClickEvents() {
    $(this).click(tabClickEvents);
    $(this).click(bloomRipple);
  }
  function tabClickEvents() {
    let prevId = parseInt(activeLine.attr("activeId"));
    var activeId = $(this).attr("tabId");
    var activePanel = tabPanels.eq(activeId);
    activeLine.attr("activeId", activeId);
    refreshTabsBar(prevId);
    refreshPanels();
    activePanel.scrollTop(0);
  }
  function refreshTabsBar(prevId) {
    var prevTab = tabs.eq(prevId);
    var activeId = activeLine.attr("activeId");
    var activeTab = tabs.eq(activeId);
    activeLine.css("left", activeTab.position().left);
    activeLine.css("width", activeTab.width());
    prevTab.find("label").toggleClass("active");
    activeTab.find("label").toggleClass("active");
  }
  function refreshPanels() {
    var activeId = parseInt(activeLine.attr("activeId"));
    var activePanel = tabPanels.eq(activeId);
    tabPanelsContainer.animate({scrollLeft: tabPanelsContainer.scrollLeft() + activePanel.position().left}, 275)
    for (var i = 0; i < tabPanels.length; i++) {
      tabPanels.eq(i).removeClass("active");
      tabPanels.eq(i).addClass("hide");
    }
    activePanel.removeClass("hide");
    activePanel.addClass("active");
  }
}
function initTabPanels() {
  var appBarH = appBar.height();
  tabPanelsContainer.css("padding-top", appBarH);
  tabPanelsContainer.height(tabPanelsContainer.height() - tabPanelsContainer.css("padding-top"));
  var scrollEventTimer;
  tabPanelsContainer.scroll(handleTabPanelsScroll);
  function handleTabPanelsScroll() {
    clearTimeout(scrollEventTimer);
    scrollEventTimer = setTimeout(() => {
      let closeastIndex = 0;
      tabPanels.each(index => {
        closeastIndex =
          Math.abs(tabPanels.eq(closeastIndex).position().left - 0) >
            Math.abs(tabPanels.eq(index).position().left - 0) ? index : closeastIndex;
      });
      tabsBar.find("tab").eq(closeastIndex).click()
    }, 12)
  }
}
/*card*/
function initCards() {
  $(".card.flodable").each(addFlodCardClickEvent);
  $(".card.collapse").each(addCollapseCardClickEvent);
  function addFlodCardClickEvent() {
    $(this).click(flod);
  }
  function addCollapseCardClickEvent() {
    $(this).click(display);
  }
  function flod() {
    $(this).toggleClass("flodding");
  }
  function display() {
    $(this).removeClass("collapse");
  }
}
/*button*/
function initButtons() {
  $("button").each(addRipple);
  $("button").each(addPressing);
  $("button").each(addButtonFocusEvent);
  function addButtonFocusEvent() {
    $(this).click(bloomRipple);
  }
}
function addRipple() {
  $(this).append("<ripple></ripple>");
  var ripple = $(this).find("ripple");
  var rippleSize = 1.5 * Math.max($(this).innerWidth(), $(this).innerHeight());
  ripple.width(rippleSize);
  ripple.height(rippleSize);
  ripple.css("margin-left", -rippleSize * 0.5);
  ripple.css("margin-top", -rippleSize * 0.5);
}
function addPressing() {
  $(this).append("<pressing></pressing>");
}
function bloomRipple(event) {
  event = event || window.event;
  var cardPos = $(this).offset();
  var clickPos = {
    x: event.pageX - cardPos.left,
    y: event.pageY - cardPos.top
  };
  var ripple = $(this).find("ripple");
  ripple.css("left", clickPos.x);
  ripple.css("top", clickPos.y);
  ripple.addClass("animating");
  ripple.get(0).addEventListener("animationend", rippleAnimationEnd);
  function rippleAnimationEnd() {
    $(this)
      .get(0)
      .removeEventListener("animationend", rippleAnimationEnd);
    $(this).removeClass("animating");
  }
}
/*list*/
function initLists() {
  lists.each(initList);
}
function initList() {
  $(this).attr("height", $(this).height() + "px");
  $(this).attr("width", $(this).width() + "px");
  let listdom = $(this).get(0);
  listdom.call = () => {
    this.setAttribute("state", "on");
    this.style.maxHeight = this.getAttribute("height");
    this.style.maxWidth = this.getAttribute("width");
    this.focus();
  }
  listdom.close = () => {
    this.setAttribute("state", "off");
    this.style.maxHeight = 0
    this.style.maxWidth = 0
  }
  listdom.close();
  $(this).blur(() => listdom.close());
}
/*fab*/
function changeFab(bg, primary) {
  FAB.attr("class", "raised FAB " + (primary ? " primary" : " accent"));
  FAB.html(`<i class="icon ${bg}"></i>`);
}
function hideFab() {
  FAB.css("transform", "scale(0,0)");
}
function showFab() {
  FAB.css("transform", "scale(1,1)");
}
/*input*/
function initInputs() {
  $("input").each(initInput);
}
function initInput() {
  if ($(this).attr("required"))
    $(this).after(
      '<underText class="warnning"><i class="icon alert"></i>必填项</underText>'
    );
  $(this).after("<line></line>");
  $(this).focus(visitInput);
}
function visitInput() {
  $(this).attr("visited", "true");
}
/*mask*/
function callMask() {
  $("#mask").attr("state", "on");
  document.documentElement.style.overflowY = "hidden";
}
function hideMask() {
  $("#mask").attr("state", "off");
  document.documentElement.style.overflowY = "visible";
}
/*menu*/
function initDrawerMenu() {
  $(".drawer").blur(menuOff);
}
function menuOn() {
  callMask();
  $(".drawer").focus();
  $(".drawer").attr("state", "on");
}
function menuOff() {
  $(".drawer").attr("state", "off");
  hideMask();
}
/*snackbar*/
var snackBarMsg = [];
var snackBarShowing = false;
function initSnackBar() {
  $("#snackBar").attr("state", "off");
}
function callSnackBar(msg) {
  snackBarMsg.push(msg);
  excuteSnackBarMsg();
}
function excuteSnackBarMsg() {
  if (snackBarMsg.length > 0 && !snackBarShowing) {
    snackBarShowing = true;
    var msg = snackBarMsg.shift();
    $("#snackbar").attr("state", "on");
    $("#snackbar").html("<p>" + msg + "</p>");
    setTimeout("hideSnackBar()", 2800);
  } else {
    snackBarShowing = false;
  }
}
function hideSnackBar() {
  $("#snackbar").attr("state", "off");
  setTimeout("excuteSnackBarMsg()", 450);
}
/*dialog*/
function initDialogs() {
  $(".dialog").each(initDialog);
}
function initDialog() {
  $(this).blur(hideDialog);
}
function callDialog() {
  $(".dialog").attr("state", "on");
  $(".dialog").focus();
  callMask();
}
function hideDialog() {
  $(".dialog").attr("state", "off");
  hideMask();
}
