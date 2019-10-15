# Functional Chains: Implementation


Writing a serializable chainable functional API in Javascript.

[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/you-didnt-ask-for-this.svg)](https://forthebadge.com)

All of the work below can be found in this [functional chain builder](https://github.com/patrixr/functional-chain). A ready-made and reusable npm module allowing you to generate a small API.


## Introduction

I've long thought chainable APIs were both elegant and descriptive.

And started playing around with a **functional** and **stateless** implementation, as a fun experiment. 

### The chain

Here's an example the API I'm thinking of :

```javascript
const operation = multiplyBy(2)
  .and.subtract(6)
  .and.divideBy(2);

operation(33); // => 30
```

The result should be a re-usable function that applies the different commands in order.

### Serialization

Instead of applying the operations immediately, this API is designed to return a function. The reason for that is to allow **serialization**.

Here's an example of how that would look like :


```javascript
analyse(operation);

// output =>
[
  { multiplyBy:  [2] },
  { subtract: [6]},
  { divideBy: [2] }
]
```

What are the **benefits** of serialization :

#### Testing

Serialization can be beneficial in testing: we can assert the operations are correct. Possibly replacing **end to end** tests with simpler **unit** tests\

#### Networking

A serialized operation, is one that can be sent **over the wire**, expanding the use cases of the chain.

## Exploiting JavaScript

Let's take a quick look at the language features that allow this to be possible.

### Functions are first-class objects

> A programming language is said to have First-class functions when functions in that language are treated like any other variable\
\
*source: mozilla.org*

What does that mean for us:

- we can pass functions around as **arguments**
- we can **set properties** to functions

### Scoping and closures

Closures are simpler to use than they are to explain. But here's what matters to us:

If a **function** creates another function, that new one can access its **creator's scope**. It can in turn create a new function itself, and then again, and again... building a **chain**.

## Implementing the chain

### Defining the API

Before we actually write the chain, we need to define our api:

```javascript
const API = {
  add(val) {
    return num => num + val
  },

  subtract(val) {
    return num => num - val
  },

  multiplyBy(val) {
    return num => num * val
  },

  divideBy(val) {
    return num => num / val
  }
}
```

This is pretty straightforward, each method returns a function that will apply the desired operation.

### Creating a wrapper function

We've discussed the idea of returning functions out of functions. So let's create a base function that **receives a chain**, and returns the **completed operation**.

```javascript
function Wrap(chain = []) {
	let compute = (num) => {
		// Iterate through the chain and applies the calculations
		return chain.reduce((mem, fn) => fn(mem), num);
	}

	return compute;
}
```

At this point, we have **no means of adding** anything to the chain. So let's **add methods** to our `compute` function, one for each that was defined previously.

```javascript
for (let key in API) {
  const fn = API[key];
  compute[key] = () => {
     ...
  }
}
```

We already know we need to **return a function**, that's the expected result of our chain. We also know, that this function should **allow more functions to be chained**.

Most of you saw this coming, we can simply return our `Wrap`, which does exactly that. The chaining takes place by providing it an **extended chain**.

```javascript
function Wrap(chain = []) {
	let compute = (num) => {
	  // Iterate through the chain and applies the calculations
	  return chain.reduce((mem, fn) => fn(mem), num);
	}
	
	for (let key in API) {
	  const fn = API[key];
	  compute[key] = (num) => {
        return Wrap([ ...chain, fn(num) ]);
	  }
	}

	return compute;
}
```

Currently, this usage would work :

```javascript
const operation = Wrap()
  .multiplyBy(2)
  .subtract(6)
  .divideBy(2);

operation(33); // => 30
```

## Prettifying our API

We now have a working chainable API. But the need to have `Wrap()` prefixed to any chain is not of **adequate elegance**.

### Exporting user-friendly methods

We want to be able to start our chain through one of the API's method. An easy way to achieve this is to have our module export those methods, with the wrap **included**.

```javascript

// (API Object)

// (Wrap function)

module.exports = Object
    .keys(API)
    .reduce((res, key) => {
      const fn = API[key];
      res[key] = (...params) => Wrap([ fn(...params) ]);
      return res;
    }, {});
```

We essentially **hide** the initial wrap inside the methods.

Here's how our **usage** currently looks : 

```javascript
const { multiplyBy } = require('./mychain');

const operation = multiplyBy(2)
  .subtract(6)
  .divideBy(2);

operation(33); // => 30
```

Already looking much better.

### Adding semantics

Part of our initial design was to have an optional `and` key word between each chain member. Although the need for that is arguable, let's do it for science.

And the implementation couldn't be **any simpler** :

```javascript
function Wrap(chain = []) {
	let compute = (num) => { ... }
	
	for (let key in API) {
	  const fn = API[key];
	  compute[key] = (num) => { ... }
	}
	
	// Semantics of choice
	compute.and = compute;
	compute.andThen = compute;
	compute.andThenDo = compute;

	return compute;
}
```

Which brings us to our expected usage :

```javascript
const operation = multiplyBy(2)
  .and.subtract(6)
  .andThen.divideBy(2);

operation(33); // => 30
```


## Next Step: Serialization

Thanks for reading through part one of my functional chain article.

In order to keep them short, I will continue the topic of serialization in a separate article.

If anyone has experience building chainable APIs, I would love to hear your approach and use cases.

Cheers,

Patrick