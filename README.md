# slotmachine
A rewrite of Matteo Spinelli's SpinningWheel

The [SpinningWheel][] widget is a great way for developers to mimic the iOS UIPickerView functionality
in web applications.

Slotmachine is a rewrite of SpinningWheel. It uses Coffeescript and jQuery to make the code easier to understand, maintain and develop. It makes heavy uses of asserts and defensive programming.

The main motivation for the rewrite has been to improve the ability to change the slot data on the fly, and the difficulty of tracking down (in SpinningWheel) mismatches which where happening between the slot data in the Javascript object and in the DOM. In this implementation, the DOM is used as the canonical source for the slot information and the Javascript object is not consulted after the DOM elements have been constructed.

Other additional features: 

 * Customizable buttons
 
 More documentation to follow.

[SpinningWheel]: http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch
