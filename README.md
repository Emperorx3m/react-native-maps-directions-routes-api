# MapViewDirectionsRoutesAPI

A comprehensive React Native component built on top of Google Maps New Routes API to render directions and routes on a map. This package allows you to render routes between an origin and destination with options for alternative routes, intermediate stops, extra markers, and more.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  - [Minimal Setup](#minimal-setup)
  - [Intermediate Stops Example](#intermediate-stops-example)
  - [Using onReady Callback](#using-onready-callback)
  - [Displaying Extra Markers](#displaying-extra-markers)
- [API Configuration Options](#api-configuration-options)
- [Custom Markers](#custom-markers)
- [Fit to Coordinates](#fit-to-coordinates)
- [MapViewDirectionsRoutesAPI Props](#MapViewDirectionsRoutesAPI-Props)
- [Further Customization & Examples](#further-customization--examples)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The `MapViewDirectionsRoutesAPI` component streamlines the process of fetching routes from the Google Maps Routes API and rendering them on a map. It uses various React hooks to manage state and effects, supports rerendering on prop changes, and includes built-in support for alternative routes and extra markers.

By adding this package to your application, you can easily configure the map rendering behavior with flexible options such as:
- **Origin** and **Destination** definition.
- Displaying alternative routes and updating the selected route.
- Inserting intermediate stops.
- Rendering customizable markers.
- Auto-fitting the map view to the displayed markers.

---

## Installation

To install the `MapViewDirectionsRoutesAPI` package, run the following command in your terminal:

# Using NPM
   ```bash
   npm install react-native-maps-directions-routes-api
   ```
# Using YARN
   ```bash
   yarn add react-native-maps-directions-routes-api
   ```

Ensure you have your Google Maps API key ready for usage.
Usage
Minimal Setup
The minimal setup only requires an origin, destination, and an API key. Import and use the component as follows:

   ```js

import React from 'react';
import { View } from 'react-native';
import MapViewDirectionsRoutesAPI from 'react-native-maps-directions-routes-api';

const origin = {
    latitude: 6.5244,
    longitude: 3.3792,
    heading: 0,
    customMarker: {
        image: require('./assets/myloc.png'),
        width: 40,
        height: 50,
        pinColor: 'blue',
        title: 'Start',
    },
};

const destination = {
    latitude: 6.6000,
    longitude: 3.3500,
    heading: 0,
    customMarker: {
        image: require('./assets/destino.png'),
        width: 40,
        height: 50,
        pinColor: 'yellow',
        title: 'Destino',
        anchorX: 0.5,
        anchorY: 0.25,
        centerOffsetX: 0,
        centerOffsetY: 0,
    },
};

const MinimalSetupExample = () => (
    <View style={{ flex: 1 }}>
        <MapViewDirectionsRoutesAPI
            origin={origin}
            destination={destination}
            apikey={"GOOGLE_MAPS_APIKEY"}
        />
    </View>
);

export default MinimalSetupExample;
```

## Screenshot: Minimal Setup
![Minimal Setup](https://i.imgur.com/x8nOMeg.png)

## Intermediate Stops Example
To add intermediate stops along your route use the intermediates prop. This is ideal for journeys with stops or drop-offs.

   ```js

import React from 'react';
import { View } from 'react-native';
import MapViewDirectionsRoutesAPI from 'react-native-maps-directions-routes-api';

const origin = { /* Same as above */ };
const destination = { /* Same as above */ };

const intermediateStop = {
    location: {
        latLng: {
            latitude: 6.5500,
            longitude: 3.3600,
            customMarker: {
                image: require('./assets/stop.png'),
                width: 30,
                height: 30,
                pinColor: 'green',
                title: 'Stop',
            },
        },
    },
};

const IntermediateStopsExample = () => (
    <View style={{ flex: 1 }}>
        <MapViewDirectionsRoutesAPI
            origin={origin}
            destination={destination}
            intermediates={[intermediateStop]}
            apikey={"GOOGLE_MAPS_APIKEY"}
        />
    </View>
);

export default IntermediateStopsExample;
```

## Screenshot: Intermediate Setup
![Minimal Setup](https://imgur.com/yR2K5yq.png)

### Using onReady Callback
The onReady callback is triggered when routes have been successfully fetched and are ready for use. You can access details like the distance, duration, legs, COORDINATES, polyline and more.
   ```js

import React from 'react';
import { View, Alert } from 'react-native';
import MapViewDirectionsRoutesAPI from 'react-native-maps-directions-routes-api';

const origin = { /* Origin as above */ };
const destination = { /* Destination as above */ };

const onReadyHandler = (routes) => {
    // For instance, route distances and durations can be used to update UI components.
    console.log('Routes ready:', routes);
    Alert.alert('Routes loaded', `Distance: ${routes[0].distance} meters\nDuration: ${routes[0].duration} seconds`);
};

const OnReadyExample = () => (
    <View style={{ flex: 1 }}>
        <MapViewDirectionsRoutesAPI
            origin={origin}
            destination={destination}
            apikey={"GOOGLE_MAPS_APIKEY"}
            onReady={onReadyHandler}
        />
    </View>
);

export default OnReadyExample;
```

### Displaying Extra Markers
You can dynamically display extra markers by tying the extraMarkers prop to a state. This is useful when you want to update markers based on real-time data (e.g., driver locations).
   ```js

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import MapViewDirectionsRoutesAPI from 'react-native-maps-directions-routes-api';

const origin = { /* Origin as above */ };
const destination = { /* Destination as above */ };

const generateExtraMarkers = () =>
    Array.from({ length: 40 }, (_, index) => {
        const isBike = Math.random() < 0.1; // 10% chance
        return {
            latitude: 6.52 + Math.random() * 0.01,
            longitude: 3.38 + Math.random() * 0.001,
            heading: Math.floor(Math.random() * 360),
            customMarker: {
                image: isBike ? require('./assets/bikemap.png') : require('./assets/carmap.png'),
                width: 30,
                height: 40,
                pinColor: isBike ? 'blue' : 'yellow',
                title: isBike ? 'Bike Stop' : 'Car Stop',
                anchorX: 0.5,
                anchorY: 0.25,
                centerOffsetX: 0,
                centerOffsetY: 0,
            },
        };
    });

const ExtraMarkersExample = () => {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        // Simulate fetching/updating extra markers data.
        const markers = generateExtraMarkers();
        setDrivers(markers);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <MapViewDirectionsRoutesAPI
                origin={origin}
                destination={destination}
                apikey={"GOOGLE_MAPS_APIKEY"}
                extraMarkers={drivers}
            />
        </View>
    );
};

export default ExtraMarkersExample;
```

## Screenshot: Multiple Markers
![Minimal Setup](https://imgur.com/Rm5fsaO.png)

API Configuration Options
Below is a summary of the key configuration props available:

   ```ts

* origin (object, required): The starting point of the route. Must include latitude, longitude, heading (optional), and a customMarker object (optional) (for customizing marker appearance).

* destination (object, required): The end point of the route. Similar structure as origin.

* apikey (string, required): Your Google Maps API key.

* waypoints (array, optional): Additional stop points along the route.

* intermediates (array, optional): Intermediate stops along the route. Each element should have a location property with latLng.

* onStart (function, optional): Callback invoked when route fetching begins.

* onReady (function, optional): Callback invoked when routes are successfully fetched. Provides route details (distance, duration, legs, etc.).

* onError (function, optional): Callback invoked when there is an error fetching the route.

* onSelectRoute (function, optional): Callback when a user selects a particular route.

* mode (string, default: DRIVE): Travel mode such as driving, walking, etc.

* languageCode (string, default: en-US): Language for the API responses.

* resetOnChange (boolean, default: true): Whether to reset state when key properties change.

* optimizeWaypoints (boolean, default: false): Optimize the order of intermediate waypoints.

* computeAlternativeRoutes (boolean, default: false): Whether to compute alternative routes.

* directionsServiceBaseUrl (string, default: https://routes.googleapis.com/directions/v2:computeRoutes): Base URL for the routes API.

* units (string, default: IMPERIAL): Measurement units.

* region (string): The region code.

* precision (string, default: low): Precision of the route.

* timePrecision (string, default: none): Time precision.

* channel (string): Optional channel.

* fieldMask (string): Fields to include in the response.

* routingPreference (string, default: TRAFFIC_AWARE_OPTIMAL): Routing preference.

* polylineQuality (string, default: OVERVIEW): Quality of the encoded polyline.

* polylineEncoding (string, default: ENCODED_POLYLINE): Polyline encoding.

* departureTime (any): Departure time.

* arrivalTime (any): Arrival time.

* routeModifiers (object): Modifiers for the route.

* regionCode (string): Specific region code.

* requestedReferenceRoutes (any): To request specific reference routes.

* extraComputations (array): Additional computations such as FUEL_CONSUMPTION, TOLLS.

* transitPreferences (object): Preferences for transit.

* fitToCoordinates (object): Configuration for auto-fitting the displayed markers on the map view. See the Fit to Coordinates section.

* extraMarkers (array): Additional markers to display on the map.

* Custom Markers
Customize markers by providing a customMarker object on each coordinate object. The keys include:
-- # image: Local asset to use as the marker.
-- # width & height: Dimensions for the marker.
-- # pinColor: Color if no custom image is provided.
-- # title: Title for the marker.
-- # anchorX & anchorY: Anchor points.
-- # centerOffsetX & centerOffsetY: Offset adjustments.
If customMarker is omitted, the default marker (red) is used.
```
```bash
 customMarker: {
           ...other props
            anchorX: 0.5, // play around with these figures to position your customMarker at the exact position
            anchorY: 0.25, // play around with these figures to position your customMarker at the exact position
            centerOffsetX: 0, // play around with these figures to position your customMarker at the exact position
            centerOffsetY: 0, // play around with these figures to position your customMarker at the exact position
        },
```

### Fit to Coordinates
The component uses the mapRef to automatically adjust the map view via the fitToCoordinates property. This positions the map so that all markers are visible. Adjust the edgePadding and animation settings via the fitToCoordinates prop.

Example configuration:
   ```js

fitToCoordinates={{
    edgePadding: { top: 90, right: 50, bottom: 100, left: 50 },
    animated: true,
}}
```


# Further Customization & Examples
You can mix and match the configurations as needed to suit your application. For example:

Switching between selected and non-selected routes: Tapping a route polyline updates the selected route using the onPress handler.
Dynamically update extra markers: Bind the extraMarkers prop to a state that fetches or updates marker locations in real-time.
Refer to the code samples provided in the usage section for practical implementations.

## MapViewDirectionsRoutesAPI Props

The `MapViewDirectionsRoutesAPI` component accepts the following props:

### Required Props

* **`apikey`**: A string representing the API key for the directions service.
* **`origin`**: An object representing the starting point of the route. An object with `latitude` and `longitude` properties (e.g. `{ latitude: 40.7128, longitude: -74.0060 }`).
* **`destination`**: An object representing the ending point of the route. An object with `latitude` and `longitude` properties (e.g. `{ latitude: 34.0522, longitude: -118.2437 }`).
* **`intermediates`**: An array of objects representing intermediate points along the route. Objects with `latitude` and `longitude` properties (e.g. [{ latitude: 41.8781, longitude: -87.6298 }, { latitude: 39.7392, longitude: -104.9903 }]).

### Optional Props

* **`extraMarkers`**: An array of objects  representing additional markers to display along the route. Objects with `latitude` and `longitude` properties (e.g. [{ latitude: 40.7128, longitude: -74.0060 }, { latitude: 34.0522, longitude: -118.2437 }]).

### Directions Service Props

* **`mode`**: A string representing the mode of transportation (e.g. "DRIVE", "WALK", "TWO_WHEELER", "BICYCLE", "TRANSIT").
* **`languageCode`**: A string representing the language code for the directions service (e.g. "en-US").
* **`resetOnChange`**: A boolean indicating whether to reset the route when the origin, destination, or intermediates change.
* **`optimizeWaypoints`**: A boolean indicating whether to optimize the route by reordering the waypoints.
* **`directionsServiceBaseUrl`**: A string representing the base URL for the directions service.
* **`region`**: A string representing the region for the directions service (e.g. "US").

### Route Display Props

* **`selectedRouteColor`**: A string representing the color of the selected route.
* **`notselectedRouteColor`**: A string representing the color of the non-selected routes.
* **`fieldMask`**: A string representing the field mask for the directions service.

### Advanced Props

* **`computeAlternativeRoutes`**: A boolean indicating whether to compute alternative routes.
* **`routingPreference`**: A string representing the routing preference (e.g. "TRAFFIC_AWARE", "TRAFFIC_UNAWARE", "TRAFFIC_AWARE_OPTIMAL").
* **`units`**: A string representing the units for the route distances (e.g. "METRIC", "IMPERIAL").
* **`polylineQuality`**: A string representing the quality of the polyline (e.g. "OVERVIEW", "HIGH_QUALITY").
* **`polylineEncoding`**: A string representing the encoding of the polyline (e.g. "ENCODED_POLYLINE", "GEO_JSON_LINESTRING").
* **`requestedReferenceRoutes`**: A string representing the requested reference routes (e.g. "FUEL_EFFICIENT", "SHORTER_DISTANCE").
* **`extraComputations`**: An array of strings representing the extra computations to perform (e.g. ["TOLLS", "FUEL_CONSUMPTION", "TRAFFIC_ON_POLYLINE"]).
* **`transitPreferences`**: An object representing the transit preferences (e.g. `{ allowedTravelModes: ["BUS", "SUBWAY"], routingPreference: "LESS_WALKING" }`).
* **`routeModifiers`**: An object representing the route modifiers (e.g. `{ avoidTolls: true, avoidHighways: false, vehicleInfo: { emissionType: "GASOLINE" } }`).

### Event Handlers

* **`onStart`**: A function to call when the directions service starts.
* **`onReady`**: A function to call when the directions service is ready.
* **`onError`**: A function to call when an error


## Screenshots
Below are example screenshots to demonstrate different setups:

## Screenshot: Intermediate Setup no custom marker
![Intermediate Setup no custom marker](https://imgur.com/N4KcP0o.png)

## Screenshot: custom markers Setup with extra markers and compute alternate route
![custom markers Setup with extra markers and compute alternate route](https://imgur.com/Rm5fsaO.png)

## Screenshot: Zoomed custom markers Setup with extra markers and compute alternate route
![Zoomed custom markers Setup with extra markers and compute alternate route](https://imgur.com/dRvQz8y.png)

## Screenshot: custom markers Setup NO extra markers + compute alternate route
![custom markers Setup NO extra markers + compute alternate route](https://imgur.com/PO7y4mY.png)

## Screenshot: Minimal Setup + custom marker
![Minimal Setup + custom marker](https://imgur.com/x8nOMeg.png)

## Screenshot: Intermediate Setup + custom markers Setup with extra markers and compute alternate route
![Intermediate Setup + custom markers Setup with extra markers and compute alternate route](https://imgur.com/yR2K5yq.png)

# Troubleshooting
Ensure your API key is valid. A missing or invalid key will cause a warning error.
Verify that the origin and destination objects include both latitude and longitude.
When dealing with custom markers, confirm that the asset paths are correct and accessible.
Use the browser or device console to check logs printed from console.warn for additional debugging information.
License
Distributed under the MIT License. See LICENSE for more information.

Happy Mapping!
Work is in progress
PR's are welcome