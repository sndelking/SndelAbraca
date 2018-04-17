class Material {
  static initialize() {
    this.initButtons();
    this.initRipple();
    this.initInputs();
  }
  static nodes2Array(nodes) {
    return Array.prototype.slice.call(nodes);
  }
  static getButtons() {
    return this.nodes2Array(document.getElementsByTagName("button"));
  }
  static initButtons() {
    this.getButtons().forEach(button => {
      button.append(document.createElement("shade"));
    });
  }
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
    let needRippleNodes = this.getButtons();
    needRippleNodes.forEach(fatherNode => {
      let childNodes = this.nodes2Array(fatherNode.childNodes);
      if (!childNodes.includes(child => child.tagName == "ripple")) {
        let ripple = this.createRipple(fatherNode);
        fatherNode.append(ripple);
        fatherNode.onclick = e => this.rippleBlooming(e, ripple);
      }
    });
  }
  static rippleBlooming(event, ripple) {
    ripple.style.left = event.offsetX - ripple.offsetWidth / 2 + "px";
    ripple.style.top = event.offsetY - ripple.offsetHeight / 2 + "px";
    ripple.className = "blooming";
  }
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
  static initInputs() {
    this.getInputs().forEach(input => {
      let inputContainer = this.createInputContainer();
      input.parentNode.append(inputContainer);
      inputContainer.append(input);
      inputContainer.append(this.createInputLabel(input.getAttribute("label")));
    });
  }
}
window.onload = () => {
  Material.initialize();
};
