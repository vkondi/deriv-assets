# Deriv Assets React App



## Features

* Asset list filtered by category
* Real time price listing for each asset
* Highest and lowest price of each asset in the last 24 hour period
* Graphical representation of price fluctuation in last 24 hour period


###### Note: 
`All commands mentioned below must be run from the root folder of the application.`

## Running locally

For running locally,
```shell script
yarn install
```


Then,

```shell script
yarn start
```


## Creating a build & running it

Run build command,
```shell script
yarn build
```

If needed,

```shell script
yarn global add serve
```

Then,

```shell script
serve -s build
```

### Developer notes
* [`src/config.js`](/src/config.js) has all the configurations used in the application.
* Usage of `DEBUG_MODE` is implemented in case you face `rate limit` error due to usage of Basic API.
* `DEBUG_MODE` is enabled by default. Change its value in `config.js` to `false` to run the application with full data from Basic API.