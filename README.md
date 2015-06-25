# slotmachine
A rewrite of Matteo Spinelli's SpinningWheel

The [SpinningWheel][] widget is a great way for developers to mimic the iOS UIPickerView functionality
in web applications.

Slotmachine is a rewrite of SpinningWheel. It uses Coffeescript and jQuery to make the code easier to understand, maintain and develop. It makes heavy uses of asserts and defensive programming.

The main motivation for the rewrite has been to improve the ability to change the slot data on the fly, and the difficulty of tracking down (in SpinningWheel) mismatches which where happening between the slot data in the Javascript object and in the DOM. In this implementation, the DOM is used as the canonical source for the slot information and the Javascript object is not consulted after the DOM elements have been constructed. Another major motivation was to rework the slot data structure, to make it clearer for the user and move from an object to an array in order to allow predictable ordering.

## Usage

First, you need to tell the slot machine about the slots that you want to make available. This is done by passing an array of *slots* to the `SlotMachine.init` method:

### `SlotMachine.init`

```javascript
SlotMachine.init([
  { entries: [ 
               { label: "January", value: 1 }, 
               { label: "February", value: 2, default: true } 
             ] },
  { entries: [ 1,2,3,4,5,6,7,8,9,10 ], style: "sw-shrink" },
])
```

Each entry in the array represents a slot in the picker. The entry should be an object with an `entries` member and an optional `style` member. The styles are either:

* `sw-right` for right-aligned text
* `sw-readonly` for a presentational (non-functional) slot
* `sw-shrink` for a slot which is shrunk to the minimum possible width.


The `entries` member should contain an array of objects representing entries within the slot; these entries should have `label`, `value` and `default` members. The `label` is the HTML text which is displayed on the spinning wheel; the value is returned to Javascript by later functions, defaulting to the label if not supplied; if `default` is set to true, then this entry is selected when the spinner is opened. If the entries are not objects, then the label and value are taken from the array element.

### `SlotMachine.open` and `SlotMachine.close`

After initializing the slot machine you will want to open it so the user can interact with it. If you want to programmatically hide the slot machine, you can call `SlotMachine.close`; the selected values will remain accessible after the picker is hidden. If you want to completely remove the picker, call `SlotMachine.destroy`.

After the picker disappears from the screen, SlotMachine calls `SlotMachine.closeHandler()`. By default, this does nothing, but if you want an action to be done when the picker is hidden, you can override this method.

### Buttons

By default the picker contains two buttons labelled "Cancel" and "Done". Neither of these buttons do anything in particular other than hide the picker. If you want to provide actions to be fired after the buttons or pressed, or define buttons of your own, you need to set the `SlotMachine.buttons` accessor. Here is the default content of that accessor:

```javascript
SlotMachine.buttons = {
    cancel: { label: "Cancel", position: "left", style: "sw-cancel" },
    done:   { label: "Done", position: "right", style: "sw-done" }
}
```

To attach a callback to be run on button push, add a function to the `action` member of the button object:

```javascript
SlotMachine.buttons.cancel.action = function (e) { ... }
```

These must be defined *before* you call `init`.

### `SlotMachine.getSelectedValues`

To get the values selected by the user in your button callback (or anywhere else you happen to need it), use `SlotMachine.getSelectedValues`. This returns an array of the values (taken from the `value` member of the slot element object) selected in each slot.

### Action on change

When the user changes the selected value, Slot Machine calls `SlotMachine.changeAction()`. By default this does nothing; override it to perform an action on change.

### Changing slots

Eagle-eyed observers will have noticed that February does not have the same number of days as January. (Neither of them actually have ten days, but never mind.) Hence when the user changes the value of the first slot, we will need to also change the content of the second slot. This can be done with the `createSlot` method. Putting it all together:

```coffee
SlotMachine.changeAction = ->
  arr = SlotMachine.getSelectedValues()
  max = switch arr[0]
    when 4,6,9,11 then 30
    when 2 then (if leapyear then 29 else 28)
    else 31
  SlotMachine.createSlot(1, {entries: [ 1 .. max ], style: "sw-shrink" })
```

Note that slots are indexed from 0, as one would expect from a Javascript array.

## License

As with SpinningWheel, SlotMachine is released under the MIT license.

[SpinningWheel]: http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch
