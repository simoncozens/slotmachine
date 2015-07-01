# Heavily inspired by Matteo Spinelli's SpinningWheel

SlotMachine =
  cellHeight: 44,
  friction: 0.003,
  buttons:
    cancel: { label: "Cancel", position: "left", style: "sw-cancel" },
    done:   { label: "Done", position: "right", style: "sw-done" }

  scrolling: false,
  onChangeAction: () ->
    newSlotValue = SlotMachine.getValueForSlot(SlotMachine.activeSlot)
    if newSlotValue != SlotMachine.oldSlotValue
      SlotMachine.changeAction()
  changeAction: () ->
  assert: (test, label) ->
    if !test
      throw new Error("Assertion failed: "+label)

  destroy: ->
    SlotMachine.activeSlot = null
    $("#sw-wrapper").remove()

  init: (slots) ->
    SlotMachine.destroy()
    swheader = $('<div id="sw-header">')
    for name, button of this.buttons
      $("<div/>").attr("id", button.style) # Transitional
        .append(button.label)
        .on("pressed", button.action)
        .on("touchstart mousedown", this.buttonTapDown)
        .appendTo(swheader) 

    swwrapper = $('<div id="sw-wrapper"></div>').css(
      top: window.innerHeight + window.pageYOffset + 'px',
      webkitTransitionProperty: "-webkit-transform",
      webkitTransitionDuration: "400ms",      
    ).append(swheader)
    swwrapper.append('<div id="sw-slots-wrapper"><div id="sw-slots"></div></div><div id="sw-frame"></div>')
    $("body").append(swwrapper)
    SlotMachine.createSlots(slots)
    $("#sw-frame").on("touchstart mousedown", this.frameTouchstart)

  open: () ->
    $(document).on("touchstart touchmove mousedown mousemove", this.lockScreen)
    $(window).on("orientationchange", this.orientationChangeHandler)
    $(window).on("scroll", this.scrollHandler)
    $("#sw-wrapper").css(
      webkitTransitionTimingFunction: "ease-out"
      webkitTransform: "translate3d(0, -260px, 0)"      
    )
  close: () ->
    $(document).off("touchstart touchmove mousedown mousemove", this.lockScreen)
    $(window).off("orientationchange", this.orientationChangeHandler)
    $(window).off("scroll", this.scrollHandler)        
    $("#sw-wrapper").css(
      webkitTransitionTimingFunction: 'ease-in',
      webkitTransform: 'translate3d(0, 0, 0)'
    ).one("webkitTransitionEnd", this.closedHandler)

  slotByIndex: (index) ->
    s = $("#sw-slots div:nth-child("+(1+index)+") ul")
    if s[0] then return s

  createSlots: (slots) ->
    $("#sw-slots").empty()
    this.createSlot(index, slots[index]) for index in [0..slots.length-1]

  createSlot: (index, data) ->
    # Do we have this already?
    oldUl = $("#sw-slots div:nth-child("+(1+index)+")")
    if oldUl[0]
      ul = oldUl.children("ul")
      ul.empty()
    else
      ul = $("<ul/>").css({webkitTransitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'})
    
    ul.data(slotYPosition: 0)
    @assert(typeof(data.entries) =="object", "data for slot "+index+" has entries")
    for entry in data.entries
      if typeof(entry) != "object" then entry = { label: entry }
      this.assert(entry.label, "entry in slot "+index+" has a label")
      if not entry.value then entry.value = entry.label
      $("<li>"+entry.label+"</li>").data("value", entry.value).appendTo(ul) 

    if not oldUl[0]
      div = $("<div/>").addClass(data.style).append(ul)
      $("#sw-slots").append(div)
    ul.data({ slotMaxScroll: $("#sw-slots-wrapper").innerHeight() - ul.innerHeight() - 86 }) # XXX clientHeight
    defaultEntry = (entry for entry in data.entries when entry.default)
    this.scrollToValue(ul, defaultEntry[0]) if defaultEntry[0]

  scrollToValue: (slot, entry) ->
    if typeof(slot) != "object" then slot = @slotByIndex(slot)
    this.assert(entry.value, "entry has a value")
    this.assert(slot[0], "slot exists in DOM")
    count = 0
    for v in slot.children()
      if $(v).data("value") == entry.value
        this.setPosition(slot, this.cellHeight * count)
        break
      count -= 1

  setPosition: (slot, position) ->
    this.assert(slot[0], "slot is a jQuery object")
    slot.data("slotYPosition", position)
    slot.css("webkitTransform", 'translate3d(0, ' + position + 'px, 0)')

  getValueForSlot: (slot) ->
    this.assert(slot[0], "slot is a jQuery object")
    slot.unbind("webkitTransitionEnd").css("webkitTransitionDuration", 0)
    if slot.data("slotYPosition") > 0
      this.setPosition(slot, 0)
    else if slot.data("slotYPosition") < slot.data("slotMaxScroll")
      this.setPosition(slot, slot.data("slotMaxScroll"))

    index = -Math.round(slot.data("slotYPosition") / this.cellHeight)
    li = $(slot.children("li:nth-child("+(1+index)+")"))
    return li.data("value")

  getSelectedValues: ->
    rv = []
    for slot in $("#sw-slots div ul")
      slot = $(slot)
      rv.push this.getValueForSlot(slot)
    rv

  lockScreen: (e) ->
    e.preventDefault()
    e.stopPropagation()

  orientationChangeHandler: () ->
    window.scrollTo(0, 0)
    $("sw-wrapper").css("top", window.innerHeight + window.pageYOffset + 'px')
  
  scrollHandler: () ->
    $("sw-wrapper").css("top", window.innerHeight + window.pageYOffset + 'px')

  closedHandler: () ->

  buttonTapDown: (e) ->
    SlotMachine.lockScreen(e)
    button = $(e.currentTarget)
    button.on("touchmove mousemove", SlotMachine.buttonTapCancel)
    button.on("touchend mouseup", SlotMachine.buttonTapUp)
    button.addClass("sw-pressed")

  buttonTapCancel: (e) ->
    SlotMachine.lockScreen(e)
    button = $(e.currentTarget)
    button.off("touchmove mousemove", SlotMachine.buttonTapcancel)
    button.off("touchend mouseup", SlotMachine.buttonTapUp)
    button.removeClass("sw-pressed")

  buttonTapUp: (e) ->
    SlotMachine.lockScreen(e)    
    SlotMachine.buttonTapCancel(e)
    button = $(e.currentTarget)
    $("#sw-wrapper").one "webkitTransitionEnd", ->
      button.trigger("pressed")   
    SlotMachine.close()

  frameTouchstart: (e) ->
    SlotMachine.lockScreen(e)
    if e.originalEvent then e = e.originalEvent
    yoffset = if e.targetTouches then e.targetTouches[0].clientY - e.target.getBoundingClientRect().top else e.offsetY
    SlotMachine.whichPos = Math.floor(yoffset / SlotMachine.cellHeight) - 2 
    # You can only go up/down a max of two positions
    SlotMachine.scrollStart(e)
    SlotMachine.oldSlotValue = SlotMachine.getValueForSlot(SlotMachine.activeSlot)

  frameTouchmove: (e) ->
    SlotMachine.lockScreen(e)
    SlotMachine.scrolling = true
    SlotMachine.scrollMove(e)

  frameTouchend: (e) ->
    SlotMachine.scrollEnd(e)
    if SlotMachine.scrolling
      SlotMachine.activeSlot.one 'webkitTransitionEnd', (e) ->
        if SlotMachine.backWithinBoundaries(e) then SlotMachine.onChangeAction(e)
      SlotMachine.scrolling = false
    else
      scrollTo = SlotMachine.activeSlot.data("slotYPosition") - (SlotMachine.whichPos * SlotMachine.cellHeight)
      if scrollTo <= 0 and scrollTo >= SlotMachine.activeSlot.data("slotMaxScroll")
        SlotMachine.activeSlot.one 'webkitTransitionEnd', (e) ->
          if SlotMachine.backWithinBoundaries(e) then SlotMachine.onChangeAction(e)
        SlotMachine.scrollTo(SlotMachine.activeSlot, scrollTo)

  scrollStart: (e) ->
    this.lockScreen(e)
    event = if e.targetTouches and e.targetTouches[0].clientX then e.targetTouches[0] else e
    for slot in $("#sw-slots div ul")
      slot = $(slot)
      if event.clientX < slot.offset().left + slot.width()
        this.activeSlot = slot
        break

    if this.activeSlot.hasClass("sw-readonly")
      $("#sw-frame").off("touchmove touchend mousemove mouseup", this.frameMoved)
      return
    slot.unbind("webkitTransitionEnd").css("webkitTransitionDuration", 0)
    theTransform = new WebKitCSSMatrix(slot.css("-webkit-transform")).m42
    if theTransform != slot.data("slotYPosition")
      this.setPosition(slot, theTransform)

    this.startY = event.clientY;
    this.scrollStartY = slot.data("slotYPosition")
    this.scrollStartTime = e.timeStamp;
    $("#sw-frame").on("touchmove mousemove", this.frameTouchmove)
    $("#sw-frame").on("touchend mouseup", this.frameTouchend)
    return true

  scrollMove: (e) ->
    if e.originalEvent then e = e.originalEvent
    event = if e.targetTouches then e.targetTouches[0] else e
    topDelta = event.clientY - this.startY
    if this.activeSlot.data("slotYPosition") > 0 or this.activeSlot.data("slotYPosition") < this.activeSlot.data("slotMaxScroll")
      topDelta /= 2
    this.setPosition(this.activeSlot, this.activeSlot.data("slotYPosition") + topDelta)
    this.startY = event.clientY
    if e.timeStamp - this.scrollStartTime > 80
      this.scrollStartY = this.activeSlot.data("slotYPosition")
      this.scrollStartTime = e.timeStamp;

  scrollEnd: (e) ->
    $("#sw-frame").off("touchmove mousemove", this.frameTouchmove)
    $("#sw-frame").off("touchend mouseup", this.frameTouchend)
    ypos = this.activeSlot.data("slotYPosition")
    maxScroll = this.activeSlot.data("slotMaxScroll")
    if ypos > 0 
      this.scrollTo(this.activeSlot, 0)
      return false
    else if ypos < maxScroll
      this.scrollTo(this.activeSlot, maxScroll)
      return false
    scrollDistance = ypos - this.scrollStartY
    if scrollDistance < this.cellHeight / 1.5 and scrollDistance > -this.cellHeight / 1.5
      if ypos % this.cellHeight
        this.scrollTo(this.activeSlot, Math.round(ypos / this.cellHeight) * this.cellHeight, '250ms');
      return false
    
    scrollDuration = e.timeStamp - this.scrollStartTime
    newDuration = (2 * scrollDistance / scrollDuration) / this.friction
    newScrollDistance = (this.friction / 2) * (newDuration * newDuration)
    if newDuration < 0
      newDuration = -newDuration
      newScrollDistance = -newScrollDistance

    newPosition = ypos + newScrollDistance
    if newPosition > 0
      newPosition /= 2
      newDuration /= 3
      if newPosition > $("#sw-slots-wrapper").innerHeight() / 4
        newPosition = $("#sw-slots-wrapper").innerHeight() / 4
    else if newPosition < maxScroll
      newPosition = (newPosition - maxScroll) / 2 + maxScroll
      newDuration /= 3
      if newPosition < maxScroll - $("#sw-slots-wrapper").innerHeight() / 4
        newPosition = $("#sw-slots-wrapper").innerHeight() / 4
    else
      newPosition = Math.round(newPosition / this.cellHeight) * this.cellHeight

    this.scrollTo(this.activeSlot, Math.round(newPosition), Math.round(newDuration) + 'ms');
    return true

  scrollTo: (slot, dest, runtime) ->
    slot.css("webkitTransitionDuration", runtime || "250ms")
    this.setPosition(slot, dest)
    if slot.data("slotYPosition") > 0 or slot.data("slotYPosition") < slot.data("slotMaxScroll")
      slot.one("webkitTransitionEnd", this.backWithinBoundaries)

  backWithinBoundaries: (e) ->
    slot = $(e.target)
    if slot.data("slotYPosition") > 0 
      SlotMachine.scrollTo(slot, 0)
      return false
    else if slot.data("slotYPosition") < slot.data("slotMaxScroll")
      SlotMachine.scrollTo(slot, slot.data("slotMaxScroll"))
      return false
    else
      return true
