# lucos-time-component
A web component for displaying the NTP-synced time on lucos apps


## Technologies used
* ES Modules
* Web Components

## Usage
Include the following in your javascript:
```
import 'lucos_time_component';
```

Include the following in your html:
```
<lucos-time></lucos-time>
```

## Manual Testing
Run:
```
npm run example
```
This uses webpack to build the javascript and then opens a html page which includes the web component

## Unit Testing
Run:
```
npm test
```


## Publish to npm

Automatically publishes on the `main` branch

Make sure to bump the version number in package.json. (Can use `npm version ${version_number}`).
