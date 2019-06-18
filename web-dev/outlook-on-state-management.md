# Web dev series
# An outlook on state management

This article takes a step back to reflect on today's state management practices in *front-end* web development.
 
## Not a tutorial 

With today's resources, it would likely take you less than a minute to discover an abundance of great tech guides on how to write robust web applications.   

If you've spent a bit of time doing that, you've surely landed on tutorials for *"state container"* libraries and patterns, aka *"stores"*. Most famously **Redux** which is often used in React apps, or it's Vue counterpart **Vuex**.

Frankly, I could not write better tutorials if I tried. Instead, what I want to do here is spend a moment to think about **WHY** we are doing all of that, to learn what it truly means to write a good app.

Before we continue, I will give a quick shoutout to Hassan Djirdeh's great tutorial on [Managing State in Vue.js](https://medium.com/fullstackio/managing-state-in-vue-js-23a0352b1c87). If you are looking for a more technical and hands-on article, definitely check it out.

## What is a stateful system ?

If you've never asked yourself the question of whether your system was of a stateful nature, then the odds are that it was.

Let's try to define it as best we can :

> *An application is categorized as stateful if it stores data that will in turn affect the behaviour and output of the system*

To give that definition some context, let's take a simple example :

Example: *A user logs into your application. The code retrieves a piece of user related data and stores it. The next time you open the application, the app reads that stored data, understands that you are logged in and directly opens your profile page.*

In the above example the **state**, which consists of the user's data, affects the **behaviour** of the app which here decides to show you a different page.

Writing an app in that manner is *so incredibly common* that we rarely take a moment to think about it.

... *but we really should*

## Side effects

Here is a common definition of a software bug

> *A software bug is an error, flaw, failure or fault in a computer program or system that causes it to produce an incorrect or unexpected result, or to behave in unintended ways*  
  
Source: [Wikipedia](https://en.wikipedia.org/wiki/Software_bug)
  
Let's bring our attention to one word: 

> ... or to **behave** in unintended ways

Also present in the definition of a stateful system:
  
> ...will in turn affect the **behaviour** and output of the system

Though this would seem obvious to some, poorly managing our data is a **direct cause** of bugs, leading to instability. One common term is [side effects](https://en.wikipedia.org/wiki/Side_effect_(computer_science)). 

All of this loops back to data:

* Data is unpredictable
* Data can be faulty
* Data can be mutated

Let's tie this all together with some scenarios to illustrate those side-effects.

### Case 1: Unexpected mutation

Let's start with a sample of data:  
  
```javascript
{
	message: 'This is my first post',
	timestamp: 1560044669311
}  
```

We decide to display the **date** as a user friendly **string** showing how long ago the message was posted e.g "*1 hour ago*"

Our junior developer, not knowing any better, decides to format it nicely, **mutating** the data in the process:

```javascript
post.timestamp = moment(post.timestamp).fromNow()
```

If reading this line gave you an uneasy feeling, congratulations, you understand the **dangers** of data mutation.

**Fast forward** to moments later in the application's life, when another piece of code reads that post, **expecting** a number value.

```javascript  
console.log(post.timestamp); // => '1 hour ago'
new Date(post.timestamp); // => Invalid Date
```
  
This, as you can expect, returns an invalid date, eventually leading up to a **bug**.

### Case 2: Multiple sources of data

A JWT token is returned after a successful user login. It is added to the **local storage** and attached to requests when connecting to the server.

The app is structured with multiple **service classes**, nicely representing the different functionalities of the API, e.g

```javascript
class UserService { ... }
class SearchService { ... }
```
  
It wouldn't be too far fetched to have all of them hold an **authToken** property to use when calling the API. 

e.g

```javascript
apiCall() {
	ajax('/some/url', { Authorization: this.authToken })
}  
```

And with every user based application, comes a  **logout** feature:

```javascript
logout() {  
	localStorage.setItem('jwt', null);
	UserService.clearToken();
	SearchService.clearToken();
}
```

That *kinda* works, not great but let's go with it for the sake of making our point.

Now comes a feature request, we want our user to be able to interact with his playlists. Simple, we add a new service :  

```javascript
class PlaylistService { ... }
```

**!Problem!** we forgot to clear the token of that new service in the logout method.

What would now happen if I logged out of the app, we can imagine a multitude of bugs:

- The app could modify user data even after logout
- The app could act on behalf of the wrong user
- The app could believe a user is still logged in


Some would think that there's nothing inherently wrong in the architecture we're portraying but we shouldn't need to remember to clear the PlaylistService token. In the robust system we're about to build, **we won't need to**.

## How resources define practices

We don't need to go far back in history to remember when a computer's memory was measured in megabytes, even kilobytes.

When we work on systems with limited resources, there's  a good incentive in **mutating** data and **reusing** memory. The risks of side effects in exchange of a low memory footprint is a fair **tradeoff**.

Today resources are usually plentiful. We can allow ourselves to use more data for the sake of **stability**.

What does that mean in every day life: 

- Writing [pure functions](https://en.wikipedia.org/wiki/Pure_function)
- Recreating alternate datasets instead of mutating them
- Using language features to secure data (e.g `const`)
- Carefully selecting libraries e.g
	- [Immutable.js](https://immutable-js.github.io/immutable-js/) as its name suggests, it is specifically made to provide non-mutable structures 
	- [Moment.js](https://momentjs.com) although a very powerful tool, it is also known for having mutating methods, tread carefully

Practices change over **time** and across **fields**. Web development is now seeing patterns borrowed from [functional programming](https://en.wikipedia.org/wiki/Functional_programming) as the two worlds start to mesh together. A great example of that is [Elm](https://elm-lang.org), a functional language that compiles to JavaScript.

## Is the grass greener on the other side ?

We've gone over a lot of downsides of building stateful systems. One question arises: **Could we build stateless web apps** ?
Although stateless designs have existed on the backend side for a while, it is not a question we often ask ourselves for front-end apps.

Nothing prevents us technically from doing so, but applications are often **designed as stateful**. An example of that would be a shopping cart: a feature revolving around the ability to **store** and **edit** data.

Building an app with a state, although prone to side-effects, offers a lot of **convenience** often taken for granted. The absence of local data would double efforts only to get around that restriction.

So we know that the state is not going away, and we know that it is prone to errors. So how can we **manage** it efficiently.

## The birth of flux

The most popular store containers are derived from the Flux pattern. Despite the differences we may find, they all try to solve the **same problem** and share **core values**. 

### Formalization

By their sheer existence, those containers bring the state to the front line of the application, and under the eyes of developers.

No longer on the sidelines, it transforms the data into something **official**, **noticeable** and therefore **worth taking care of**.

### Direct access  
  
  Apps are typically built as a tree structure of components. The data **cascades** down the tree, being passed on and on.
  
  That opens up a great number of opportunities for mishandling data. We could jokingly call that a software version of the [Chinese whispers](https://en.wikipedia.org/wiki/Chinese_whispers) game.
  
  Flux-inspired stores can mitigate the risks, as components can retrieve the data straight from a source of truth.  
  
The Chinese whispers analogy displays how **information distortion** is greater the longer the chain is. This also leads us to a fair assumption that state containers are more valuable in **larger apps**. 

### Single source of truth

Having a piece of information stored in multiple parts of the app has its own share of risks. It creates opportunities for it to get **out of sync**.

A managed store solves that by providing a single location in which to store information. It can be described as a **golden source** of data.

### Encapsulation

State containers will typically avoid exposing the state directly. For the simple purpose of **protecting** it from unexpected mutations.

For updates which are required, the store will expose a set of methods which will apply precisely the required changes to the data.

By exposing **limited and controlled mutations**, it reduces the number of potential unexpected and uncontrolled changes. 

### Accountability and traceability

When dealing with **bugs** caused by an unexpected or wrong mutation, finding the source of that mutation can quickly become a hassle. Every piece of code is a potential suspect.

Luckily, a state manager only allows changes through a **limited** set of entry points. This **narrows down** the list of suspects: either the mutator method itself, or whichever code called it.

## Thanks

Many thanks to those who have suffered through the entirety of the article.

*Quick disclaimer: everything written here is the product of my understanding, experience and opinions, and should by no means be considered an absolute source of truth.*

In addition, I would love to hear your thoughts and comments on this topic.   
I anyone wish to contribute and suggest changes, the paper will be available on my [github](https://github.com/patrixr).



