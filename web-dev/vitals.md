# Publishing my vitals over the cloud

Having grown up with an over-protective and worrying father, my moving away never sat quite well with him.

After years of answering regular text messages assessing my well-being, I've decided to try out a different approach.

## The Project

The idea is to build a dashboard that my father can regularly check to ensure that I'm alive and well. Hopefully reducing his anxiety and paranoia over my inescapable impending doom.

I decided to leverage my enthusiasm for Fitbit products with my understanding of the cloud to build this.

I settled on a VueJS + ExpressJS tech stack for fast prototyping. Details can always be found on my [github](https://github.com/patrixr).

## Using the Fitbit API

Having both a connected scale and wristband, the [Fitbit API](https://dev.fitbit.com/build/reference/web-api/) gives me access to a multitude of data points:

- Heart rate
- Daily activity
- Steps
- Body (Weight/Fat/BMI)
- Sleep info
- and many more

The goal is to have our server periodically retrieve data through the api.



### Step 1: Registering an application


First things first, let's head over to the Fitbit developer console and [register an application](https://dev.fitbit.com/apps/new).

This will provide us with a `CLIENT_ID/CLIENT_SECRET` key pair required for an **OAuth2** authentication.


**Important** : 

The **detailed** heart rate data, also known as *"Heart Rate Intraday Time Series"* , is currently only available through the **Personal** app type, which we are using today.

Given that this project only displays data, the app should be marked as **Read-Only**.

![](https://files.tronica.io/manual-uploads/vitals_fitbit_app_screenshot.png)

### Step 2: Authenticate

For a quick and painless authentication, I am using the [passport-fitbit-oauth2](https://www.npmjs.com/package/passport-fitbit-oauth2) module.

#### Creating the Strategy

```javascript

const Strategy = new FitbitStrategy({
  clientID:     config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL:  config.CALLBACK_URL,
  scope: [
    'sleep', 'weight', 'activity',
    'heartrate', 'location', 'profile',
    'nutrition', 'social'
  ]
}, (access_token, refresh_token, profile, done) => {
    // store the tokens
    done( ... );
})

```


#### Hooking it up to ExpressJS

```javascript
passport.use(Strategy);

const authenticate = passport.authenticate('fitbit', {
  session: false,
  successRedirect: '/',
  failureRedirect: '/error'
});

app.get('/login', once, authenticate);
app.get('/callback', once, authenticate);
```

Access tokens eventually **expire**, that can be detected by the return of a `401` from the API. A sign for us to proceed with the [Token Refresh](https://dev.fitbit.com/build/reference/web-api/oauth2/#refreshing-tokens).

### Step 3: Retrieving data


Now that we have the Fitbit **access token**, we can start making calls to their Web API.

Here's an example of how to retrieve todays' Heart Rate Intraday Time Series:

```
GET https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1min.json
```

The server then returns the following JSON :

```json
{
    "activities-heart-intraday": {
        "dataset": [
            {
                "time": "00:01:00",
                "value": 64
            },
            {
                "time": "00:02:00",
                "value": 63
            },
            ...
        ],
        "datasetInterval": 1,
        "datasetType": "minute"
    }
}
```


## Building the dashboard

With this being a passion project, I pulled in a few libraries I love to quickly get going.

- [Vue](https://vuejs.org) as a framework, a choice of comfort
- [Vue Trend](https://github.com/QingWei-Li/vue-trend) for slick looking graphs
- [Font Awesome](https://fontawesome.com) for the icons, a classic
- [Animate.css](https://daneden.github.io/animate.css/) exclusively for the heart pulsing animation


After a bit of wiring around, the following was birthed :

![](https://files.tronica.io/manual-uploads/vitals_app_screenshot_montage_large.png)

## Securing the app

The web app exposes very personal data of mine, notably my fat percentage which can be seen sky rocketing around the Christmas holidays. 

For this reason, I hooked up my own tiny CMS ([Pocket](https://github.com/patrixr/pocket-cms)), which provides me with users, access control and an admin panel out of the box.

![](https://files.tronica.io/manual-uploads/vitals_pocket_admin_screenshot.png)

## Improvement ideas

Here are a few things I'm thinking of adding or have considered :

- My nutrition (would require me to input everything I eat)
- A button that reminds me to drink water
- My location, that may be a bit too much

## Conclusion

Despite this project being extremely small and simplistic, I enjoyed the concept of making family members happier through technology.

Would love to hear your thoughts and experiences in writing code for well being.

Cheers,

Patrick




