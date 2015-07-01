var SlotMachine;

SlotMachine = {
  cellHeight: 44,
  friction: 0.003,
  buttons: {
    cancel: {
      label: "Cancel",
      position: "left",
      style: "sw-cancel"
    },
    done: {
      label: "Done",
      position: "right",
      style: "sw-done"
    }
  },
  scrolling: false,
  onChangeAction: function() {
    var newSlotValue;
    newSlotValue = SlotMachine.getValueForSlot(SlotMachine.activeSlot);
    if (newSlotValue !== SlotMachine.oldSlotValue) {
      return SlotMachine.changeAction();
    }
  },
  changeAction: function() {},
  assert: function(test, label) {
    if (!test) {
      throw new Error("Assertion failed: " + label);
    }
  },
  destroy: function() {
    SlotMachine.activeSlot = null;
    $("#sw-wrapper").remove();
    window.removeEventListener('orientationchange', this, true);
    window.removeEventListener('scroll', this, true);
    $(document).off("touchstart touchmove mousedown mousemove", this.lockScreen);
    $(window).off("orientationchange", this.orientationChangeHandler);
    return $(window).off("scroll", this.scrollHandler);
  },
  init: function(slots) {
    var button, name, swheader, swwrapper, _ref;
    SlotMachine.destroy();
    swheader = $('<div id="sw-header">');
    _ref = this.buttons;
    for (name in _ref) {
      button = _ref[name];
      $("<div/>").attr("id", button.style).append(button.label).on("pressed", button.action).on("touchstart mousedown", this.buttonTapDown).appendTo(swheader);
    }
    swwrapper = $('<div id="sw-wrapper"></div>').css({
      top: window.innerHeight + window.pageYOffset + 'px',
      webkitTransitionProperty: "-webkit-transform",
      webkitTransitionDuration: "400ms"
    }).append(swheader);
    swwrapper.append('<div id="sw-slots-wrapper"><div id="sw-slots"></div></div><div id="sw-frame"></div>');
    $("body").append(swwrapper);
    SlotMachine.createSlots(slots);
    $(document).on("touchstart touchmove mousedown mousemove", this.lockScreen);
    $(window).on("orientationchange", this.orientationChangeHandler);
    $(window).on("scroll", this.scrollHandler);
    return $("#sw-frame").on("touchstart mousedown", this.frameTouchstart);
  },
  open: function() {
    return $("#sw-wrapper").css({
      webkitTransitionTimingFunction: "ease-out",
      webkitTransform: "translate3d(0, -260px, 0)"
    });
  },
  close: function() {
    return $("#sw-wrapper").css({
      webkitTransitionTimingFunction: 'ease-in',
      webkitTransform: 'translate3d(0, 0, 0)'
    }).one("webkitTransitionEnd", this.closedHandler);
  },
  slotByIndex: function(index) {
    var s;
    s = $("#sw-slots div:nth-child(" + (1 + index) + ") ul");
    if (s[0]) {
      return s;
    }
  },
  createSlots: function(slots) {
    var index, _i, _ref, _results;
    $("#sw-slots").empty();
    _results = [];
    for (index = _i = 0, _ref = slots.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
      _results.push(this.createSlot(index, slots[index]));
    }
    return _results;
  },
  createSlot: function(index, data) {
    var defaultEntry, div, entry, oldUl, ul, _i, _len, _ref;
    oldUl = $("#sw-slots div:nth-child(" + (1 + index) + ")");
    if (oldUl[0]) {
      ul = oldUl.children("ul");
      ul.empty();
    } else {
      ul = $("<ul/>").css({
        webkitTransitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
      });
    }
    this.assert(typeof data.entries === "object", "data for slot " + index + " has entries");
    _ref = data.entries;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      if (typeof entry !== "object") {
        entry = {
          label: entry
        };
      }
      this.assert(entry.label, "entry in slot " + index + " has a label");
      if (!entry.value) {
        entry.value = entry.label;
      }
      $("<li>" + entry.label + "</li>").data("value", entry.value).appendTo(ul);
    }
    if (!oldUl[0]) {
      div = $("<div/>").addClass(data.style).append(ul);
      $("#sw-slots").append(div);
    }
    ul.data({
      slotMaxScroll: $("#sw-slots-wrapper").innerHeight() - ul.innerHeight() - 86
    });
    defaultEntry = (function() {
      var _j, _len1, _ref1, _results;
      _ref1 = data.entries;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        entry = _ref1[_j];
        if (entry["default"]) {
          _results.push(entry);
        }
      }
      return _results;
    })();
    if (defaultEntry[0]) {
      return this.scrollToValue(ul, defaultEntry[0]);
    }
  },
  scrollToValue: function(slot, entry) {
    var count, v, _i, _len, _ref, _results;
    if (typeof slot !== "object") {
      slot = this.slotByIndex(slot);
    }
    this.assert(entry.value, "entry has a value");
    this.assert(slot[0], "slot exists in DOM");
    count = 0;
    _ref = slot.children();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      if ($(v).data("value") === entry.value) {
        this.setPosition(slot, this.cellHeight * count);
        break;
      }
      _results.push(count -= 1);
    }
    return _results;
  },
  setPosition: function(slot, position) {
    this.assert(slot[0], "slot is a jQuery object");
    return slot.css("webkitTransform", 'translate3d(0, ' + position + 'px, 0)');
  },
  getPosition: function(slot) {
    return new WebKitCSSMatrix(slot.css("-webkit-transform")).m42;
  },
  getValueForSlot: function(slot) {
    var index, li;
    this.assert(slot[0], "slot is a jQuery object");
    slot.unbind("webkitTransitionEnd").css("webkitTransitionDuration", 0);
    if (this.getPosition(slot) > 0) {
      this.setPosition(slot, 0);
    } else if (this.getPosition(slot) < slot.data("slotMaxScroll")) {
      this.setPosition(slot, slot.data("slotMaxScroll"));
    }
    index = -Math.round(this.getPosition(slot) / this.cellHeight);
    li = $(slot.children("li:nth-child(" + (1 + index) + ")"));
    return li.data("value");
  },
  getSelectedValues: function() {
    var rv, slot, _i, _len, _ref;
    rv = [];
    _ref = $("#sw-slots div ul");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      slot = _ref[_i];
      slot = $(slot);
      rv.push(this.getValueForSlot(slot));
    }
    return rv;
  },
  lockScreen: function(e) {
    e.preventDefault();
    return e.stopPropagation();
  },
  orientationChangeHandler: function() {
    window.scrollTo(0, 0);
    return $("sw-wrapper").css("top", window.innerHeight + window.pageYOffset + 'px');
  },
  scrollHandler: function() {
    return $("sw-wrapper").css("top", window.innerHeight + window.pageYOffset + 'px');
  },
  closedHandler: function() {},
  buttonTapDown: function(e) {
    var button;
    SlotMachine.lockScreen(e);
    button = $(e.currentTarget);
    button.on("touchmove mousemove", SlotMachine.buttonTapCancel);
    button.on("touchend mouseup", SlotMachine.buttonTapUp);
    return button.addClass("sw-pressed");
  },
  buttonTapCancel: function(e) {
    var button;
    SlotMachine.lockScreen(e);
    button = $(e.currentTarget);
    button.off("touchmove mousemove", SlotMachine.buttonTapcancel);
    button.off("touchend mouseup", SlotMachine.buttonTapUp);
    return button.removeClass("sw-pressed");
  },
  buttonTapUp: function(e) {
    var button;
    SlotMachine.lockScreen(e);
    SlotMachine.buttonTapCancel(e);
    button = $(e.currentTarget);
    $("#sw-wrapper").one("webkitTransitionEnd", function() {
      return button.trigger("pressed");
    });
    return SlotMachine.close();
  },
  frameTouchstart: function(e) {
    var yoffset;
    SlotMachine.lockScreen(e);
    yoffset = e.targetTouches ? e.targetTouches[0].clientY - e.target.getBoundingClientRect().top : e.offsetY;
    SlotMachine.whichPos = Math.floor(yoffset / SlotMachine.cellHeight) - 2;
    SlotMachine.scrollStart(e);
    return SlotMachine.oldSlotValue = SlotMachine.getValueForSlot(SlotMachine.activeSlot);
  },
  frameTouchmove: function(e) {
    SlotMachine.lockScreen(e);
    SlotMachine.scrolling = true;
    return SlotMachine.scrollMove(e);
  },
  frameTouchend: function(e) {
    var scrollTo;
    SlotMachine.scrollEnd(e);
    if (SlotMachine.scrolling) {
      SlotMachine.activeSlot.one('webkitTransitionEnd', function(e) {
        if (SlotMachine.backWithinBoundaries(e)) {
          return SlotMachine.onChangeAction(e);
        }
      });
      return SlotMachine.scrolling = false;
    } else {
      scrollTo = SlotMachine.getPosition(SlotMachine.activeSlot) - (SlotMachine.whichPos * SlotMachine.cellHeight);
      if (scrollTo <= 0 && scrollTo >= SlotMachine.activeSlot.data("slotMaxScroll")) {
        SlotMachine.activeSlot.one('webkitTransitionEnd', function(e) {
          if (SlotMachine.backWithinBoundaries(e)) {
            return SlotMachine.onChangeAction(e);
          }
        });
        return SlotMachine.scrollTo(SlotMachine.activeSlot, scrollTo);
      }
    }
  },
  scrollStart: function(e) {
    var event, slot, _i, _len, _ref;
    this.lockScreen(e);
    event = e.targetTouches ? e.targetTouches[0] : e;
    _ref = $("#sw-slots div ul");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      slot = _ref[_i];
      slot = $(slot);
      if (event.clientX < slot.offset().left + slot.width()) {
        this.activeSlot = slot;
        break;
      }
    }
    if (this.activeSlot.hasClass("sw-readonly")) {
      $("#sw-frame").off("touchmove touchend mousemove mouseup", this.frameMoved);
      return;
    }
    slot.unbind("webkitTransitionEnd").css("webkitTransitionDuration", 0);
    this.startY = event.clientY;
    this.scrollStartY = this.getPosition(slot);
    this.scrollStartTime = e.timeStamp;
    $("#sw-frame").on("touchmove mousemove", this.frameTouchmove);
    $("#sw-frame").on("touchend mouseup", this.frameTouchend);
    return true;
  },
  scrollMove: function(e) {
    var event, topDelta;
    event = e.targetTouches ? e.targetTouches[0] : e;
    topDelta = event.clientY - this.startY;
    if (this.getPosition(this.activeSlot) > 0 || this.getPosition(this.activeSlot) < this.activeSlot.data("slotMaxScroll")) {
      topDelta /= 2;
    }
    this.setPosition(this.activeSlot, this.getPosition(this.activeSlot) + topDelta);
    this.startY = event.clientY;
    if (e.timeStamp - this.scrollStartTime > 80) {
      this.scrollStartY = this.getPosition(this.activeSlot);
      return this.scrollStartTime = e.timeStamp;
    }
  },
  scrollEnd: function(e) {
    var maxScroll, newDuration, newPosition, newScrollDistance, scrollDistance, scrollDuration, ypos;
    $("#sw-frame").off("touchmove mousemove", this.frameTouchmove);
    $("#sw-frame").off("touchend mouseup", this.frameTouchend);
    ypos = this.getPosition(this.activeSlot);
    maxScroll = this.activeSlot.data("slotMaxScroll");
    if (ypos > 0) {
      this.scrollTo(this.activeSlot, 0);
      return false;
    } else if (ypos < maxScroll) {
      this.scrollTo(this.activeSlot, maxScroll);
      return false;
    }
    scrollDistance = ypos - this.scrollStartY;
    if (scrollDistance < this.cellHeight / 1.5 && scrollDistance > -this.cellHeight / 1.5) {
      if (ypos % this.cellHeight) {
        this.scrollTo(this.activeSlot, Math.round(ypos / this.cellHeight) * this.cellHeight, '250ms');
      }
      return false;
    }
    scrollDuration = e.timeStamp - this.scrollStartTime;
    newDuration = (2 * scrollDistance / scrollDuration) / this.friction;
    newScrollDistance = (this.friction / 2) * (newDuration * newDuration);
    if (newDuration < 0) {
      newDuration = -newDuration;
      newScrollDistance = -newScrollDistance;
    }
    newPosition = ypos + newScrollDistance;
    if (newPosition > 0) {
      newPosition /= 2;
      newDuration /= 3;
      if (newPosition > $("#sw-slots-wrapper").innerHeight() / 4) {
        newPosition = $("#sw-slots-wrapper").innerHeight() / 4;
      }
    } else if (newPosition < maxScroll) {
      newPosition = (newPosition - maxScroll) / 2 + maxScroll;
      newDuration /= 3;
      if (newPosition < maxScroll - $("#sw-slots-wrapper").innerHeight() / 4) {
        newPosition = $("#sw-slots-wrapper").innerHeight() / 4;
      }
    } else {
      newPosition = Math.round(newPosition / this.cellHeight) * this.cellHeight;
    }
    this.scrollTo(this.activeSlot, Math.round(newPosition), Math.round(newDuration) + 'ms');
    return true;
  },
  scrollTo: function(slot, dest, runtime) {
    slot.css("webkitTransitionDuration", runtime || "250ms");
    this.setPosition(slot, dest);
    if (this.getPosition(slot) > 0 || this.getPosition(slot) < slot.data("slotMaxScroll")) {
      return slot.one("webkitTransitionEnd", this.backWithinBoundaries);
    }
  },
  backWithinBoundaries: function(e) {
    var slot;
    slot = $(e.target);
    if (this.getPosition(slot) > 0) {
      SlotMachine.scrollTo(slot, 0);
      return false;
    } else if (this.getPosition(slot) < slot.data("slotMaxScroll")) {
      SlotMachine.scrollTo(slot, slot.data("slotMaxScroll"));
      return false;
    } else {
      return true;
    }
  }
};
