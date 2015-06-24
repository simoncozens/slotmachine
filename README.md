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

### `SlotMachine.open`

### `SlotMachine.close`

### Buttons

### `SlotMachine.getSelectedValues`

### Changing slots

## License

As with SpinningWheel, SlotMachine is released under the MIT license.

[SpinningWheel]: http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch
