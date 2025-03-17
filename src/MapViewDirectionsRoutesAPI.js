import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MapView, { Polyline, Marker } from "react-native-maps";
import isEqual from 'lodash.isequal';
import polyline from "polyline";
import { View, Image } from 'react-native';
// Constants

const MapViewDirectionsRoutesAPI = ({
	origin: initialOrigin,
	destination: initialDestination,
	waypoints: initialWaypoints = [],
	apikey,
	onStart,
	onReady,
	onError,
	onSelectRoute,
	mode = 'DRIVE',
	languageCode = 'en-US',
	resetOnChange = true,
	optimizeWaypoints = false,
	splitWaypoints = false,
	computeAlternativeRoutes = false,
	directionsServiceBaseUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes',
	units = "IMPERIAL",
	region = '',
	precision = 'low',
	timePrecision = 'none',
	channel,
	fieldMask = 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
	routingPreference = "TRAFFIC_AWARE_OPTIMAL",
	intermediates = null,
	polylineQuality = "OVERVIEW",
	polylineEncoding = "ENCODED_POLYLINE",
	departureTime = null,
	arrivalTime = null,
	routeModifiers = {},
	regionCode = null,
	//optimizeWaypointOrder = true,
	requestedReferenceRoutes = null,
	extraComputations = ["FUEL_CONSUMPTION", "TOLLS"],
	// trafficModel = BEST_GUESS,
	transitPreferences = {},
	fitToCoordinates = {
		edgePadding: { top: 90, right: 50, bottom: 100, left: 50 },
		animated: true,
	},
	extraMarkers = null,
	selectedRouteColor = "blue",
	notselectedRouteColor = "gray",
	...props
}) => {
	const [coordinates, setCoordinates] = useState(null);
	const [distance, setDistance] = useState(null);
	const [duration, setDuration] = useState(null);
	const [routes, setroutes] = useState(null)
	const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
	const [extraMarkers_, setextraMarkers_] = useState(extraMarkers)
	const prevPropsRef = useRef();
	const mapRef = useRef(null);
	const allMarkers = [
		initialOrigin,
		...(Array.isArray(intermediates) ? intermediates.map((intermediate) => intermediate?.location?.latLng) : []),
		initialDestination,
	].filter(Boolean); // Remove any null or undefined values

	useEffect(() => {
		onSelectRoute && onSelectRoute(selectedRouteIndex)
	}, [selectedRouteIndex])

	useEffect(() => {
		setextraMarkers_(extraMarkers)

	}, [extraMarkers])


	// Automatically fit the map to show all markers
	useEffect(() => {
		if (mapRef.current && allMarkers.length > 1) {
			mapRef.current.fitToCoordinates(allMarkers, fitToCoordinates);
		}
	}, [allMarkers]);

	// Reset state function
	const resetState = (cb = null) => {
		setCoordinates(null);
		setDistance(null);
		setDuration(null);
		setroutes(null)
		if (cb) cb();
	};

	// Fetch route from Google Maps API
	const fetchRoute = async (directionsServiceBaseUrl, origin, waypoints, destination, apikey, mode, languageCode, region, precision, timePrecision, channel, computeAlternativeRoutes, units, fieldMask, routingPreference, intermediates, polylineQuality, polylineEncoding, departureTime, arrivalTime, routeModifiers, regionCode, optimizeWaypointOrder, requestedReferenceRoutes, extraComputations, transitPreferences,) => {
		// Define the URL to call. Only add default parameters to the URL if it's a string.
		let url = directionsServiceBaseUrl;
		if (typeof (directionsServiceBaseUrl) === 'string') {
			url += `?key=${apikey}`;
		}

		const body = {
			origin: {
				location: {
					latLng: {
						latitude: origin.latitude,
						longitude: origin.longitude,
					},
				},
			},
			destination: {
				location: {
					latLng: {
						latitude: destination.latitude,
						longitude: destination.longitude,
					},
				},
			},
			travelMode: mode,
			routingPreference: routingPreference,
			computeAlternativeRoutes: computeAlternativeRoutes,
			languageCode: languageCode,
			units: units,
		};
		if (routingPreference) body.routingPreference = routingPreference;
		if (intermediates && intermediates.length > 0) {
			body.intermediates = intermediates.map(intermediate => ({
				location: {
					latLng: {
						latitude: intermediate.location.latLng.latitude,
						longitude: intermediate.location.latLng.longitude
					}
				}
			}));
		}

		if (polylineQuality) body.polylineQuality = polylineQuality;
		if (polylineEncoding) body.polylineEncoding = polylineEncoding;
		if (departureTime) body.departureTime = departureTime;
		if (arrivalTime) body.arrivalTime = arrivalTime;
		if (routeModifiers && Object.keys(routeModifiers).length > 0) body.routeModifiers = routeModifiers;
		if (regionCode) body.regionCode = regionCode;
		if (optimizeWaypointOrder !== undefined) body.optimizeWaypointOrder = optimizeWaypoints;
		if (requestedReferenceRoutes) body.requestedReferenceRoutes = requestedReferenceRoutes;
		if (extraComputations && extraComputations.length > 0) body.extraComputations = extraComputations;
		if (transitPreferences && Object.keys(transitPreferences).length > 0) body.transitPreferences = transitPreferences;

		if (optimizeWaypoints) {
			fieldMask += ",routes.optimized_intermediate_waypoint_index"
		}

		return fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-FieldMask": fieldMask,
			},
			body: JSON.stringify(body),
		})
			.then(response => response.json())
			.then(json => {

				if (json?.routes?.length) {
					return json
				} else {
					return Promise.reject('No routes found!');
				}
			})
			.catch(err => {
				return Promise.reject(`Error on GMAPS route request : ${err}`);
			});
	};

	// Main function to fetch and render route
	const fetchAndRenderRoute = async () => {
		if (!apikey) {
			console.warn(`MapViewDirectionsRoutesAPI Error: Missing API Key`); // eslint-disable-line no-console
			return;
		}

		if (!initialOrigin || !initialDestination) {
			return;
		}


		try {



			let origin = initialOrigin
			let destination = initialDestination

			return await fetchRoute(
				directionsServiceBaseUrl,
				origin,
				null,
				destination,
				apikey,
				mode,
				languageCode,
				region,
				precision,
				null,
				channel,
				computeAlternativeRoutes,
				units,
				fieldMask,
				routingPreference, intermediates, polylineQuality, polylineEncoding, departureTime, arrivalTime, routeModifiers, regionCode, optimizeWaypoints, requestedReferenceRoutes, extraComputations, transitPreferences,
			)
				.then(result => {
					if (result?.routes) {
						const modifiedRoutes = result.routes.map((route, index) => {
							const decodedCoordinates = polyline.decode(route.polyline.encodedPolyline).map(([latitude, longitude]) => ({
								latitude,
								longitude,
							}));


							return {
								...route,
								key: `route-${index}`, 
								coordinates: decodedCoordinates, 
							};
						});

						setroutes(modifiedRoutes); // Update state
						onReady && onReady(modifiedRoutes);
					}


					return
				})
				.catch(errorMessage => {
					resetState();
					console.warn(`MapViewDirectionsRoutesAPI Error: ${errorMessage}`); // eslint-disable-line no-console
					onError && onError(errorMessage);
				});



		} catch (errorMessage) {
			resetState();
			console.warn(`MapViewDirectionsRoutesAPI Catch Error: ${errorMessage}`); // eslint-disable-line no-console
			onError && onError(errorMessage);
		};
	};

	// ComponentDidMount equivalent
	useEffect(() => {
		fetchAndRenderRoute();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ComponentDidUpdate equivalent
	useEffect(() => {
		const prevProps = prevPropsRef.current;

		if (prevProps && (
			!isEqual(prevProps.initialOrigin, initialOrigin) ||
			!isEqual(prevProps.initialDestination, initialDestination) ||
			!isEqual(prevProps.initialWaypoints, initialWaypoints) ||
			!isEqual(prevProps.mode, mode) ||
			!isEqual(prevProps.precision, precision) ||
			!isEqual(prevProps.splitWaypoints, splitWaypoints)
		)) {
			if (resetOnChange === false) {
				fetchAndRenderRoute();
			} else {
				resetState(() => {
					fetchAndRenderRoute();
				});
			}
		}

		prevPropsRef.current = {
			initialOrigin,
			initialDestination,
			initialWaypoints,
			mode,
			precision,
			splitWaypoints
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialOrigin, initialDestination, initialWaypoints, mode, precision, splitWaypoints]);

	if (!routes || !routes[0]?.coordinates) {
		return null;
	}

	return (
		<View style={{ flex: 1 }}>
			<MapView
				ref={mapRef}
				style={{ flex: 1 }}
				initialRegion={{
					latitude: initialOrigin.latitude,
					longitude: initialOrigin.longitude,
					latitudeDelta: 0.5,
					longitudeDelta: 0.5,
				}}
			>
				{/* Origin Marker */}
				<Marker coordinate={initialOrigin}
					pinColor={initialOrigin?.customMarker?.pinColor ?? 'red'}
					anchor={initialOrigin?.customMarker?.image ? { x: initialOrigin?.customMarker?.anchorX ?? 0.5, y: initialOrigin?.customMarker?.anchorY ?? 0.25 } : undefined}
					centerOffset={initialOrigin?.customMarker?.image ? { x: initialOrigin?.customMarker?.centerOffsetX ?? 0, y: initialOrigin?.customMarker?.centerOffsetY ?? 0 } : undefined}
					title={initialOrigin?.customMarker?.title ?? 'origin'}
					rotation={initialOrigin?.heading ?? 0}>
					{initialOrigin?.customMarker?.image ? (
						<Image
							source={initialOrigin?.customMarker?.image}
							style={{
								width: initialOrigin?.customMarker?.width || 30,
								height: initialOrigin?.customMarker?.height || 30,
							}}
							resizeMode="contain"
						/>
					) : null}
				</Marker>


				{/* Destination Marker */}
				<Marker coordinate={initialDestination}
					pinColor={initialDestination?.customMarker?.pinColor ?? 'red'}
					anchor={initialDestination?.customMarker?.image ? { x: initialDestination?.customMarker?.anchorX ?? 0.5, y: initialDestination?.customMarker?.anchorY ?? 0.25 } : undefined}
					centerOffset={initialDestination?.customMarker?.image ? { x: initialDestination?.customMarker?.centerOffsetX ?? 0, y: initialDestination?.customMarker?.centerOffsetY ?? 0 } : undefined}
					title={initialDestination?.customMarker?.title ?? 'origin'}
					rotation={initialDestination?.heading ?? 0}>
					{initialDestination?.customMarker?.image ? (
						<Image
							source={initialDestination?.customMarker?.image}
							style={{
								width: initialDestination?.customMarker?.width || 30,
								height: initialDestination?.customMarker?.height || 30,
							}}
							resizeMode="contain"
						/>
					) : null}
				</Marker>

				{/* Intermediate Markers */}
				{intermediates && intermediates.map((intermediate, index) => (
					<Marker
						key={`intermediate-${index}`}
						coordinate={intermediate?.location?.latLng}
						pinColor={intermediate?.location?.latLng?.customMarker?.pinColor ?? 'red'}
						anchor={intermediate?.location?.latLng?.customMarker?.image ? { x: intermediate?.location?.latLng?.customMarker?.anchorX ?? 0.5, y: intermediate?.location?.latLng?.customMarker?.anchorY ?? 0.25 } : undefined}
						centerOffset={intermediate?.location?.latLng?.customMarker?.image ? { x: intermediate?.location?.latLng?.customMarker?.centerOffsetX ?? 0, y: intermediate?.location?.latLng?.customMarker?.centerOffsetY ?? 0 } : undefined}
						title={intermediate?.location?.latLng?.customMarker?.title ?? 'origin'}
						rotation={intermediate?.location?.latLng?.heading ?? 0}>
						{intermediate?.location?.latLng?.customMarker?.image ? (
							<Image
								source={intermediate?.location?.latLng?.customMarker?.image}
								style={{
									width: intermediate?.location?.latLng?.customMarker?.width || 30,
									height: intermediate?.location?.latLng?.customMarker?.height || 30,
								}}
								resizeMode="contain"
							/>
						) : null}
					</Marker>
				))}


				{/* EXTRA Markers */}
				{extraMarkers_ && extraMarkers_.map((extraMarker, index) => {
					return (
						<Marker coordinate={extraMarker}
							key={`extraMarker-${index}`}
							pinColor={extraMarker?.customMarker?.pinColor ?? 'red'}
							anchor={extraMarker?.customMarker?.image ? { x: extraMarker?.customMarker?.anchorX ?? 0.5, y: extraMarker?.customMarker?.anchorY ?? 0.25 } : undefined}
							centerOffset={extraMarker?.customMarker?.image ? { x: extraMarker?.customMarker?.centerOffsetX ?? 0, y: extraMarker?.customMarker?.centerOffsetY ?? 0 } : undefined}
							title={extraMarker?.customMarker?.title ?? 'origin'}
							rotation={extraMarker?.heading ?? 0}>
							{extraMarker?.customMarker?.image ? (
								<Image
									source={extraMarker?.customMarker?.image}
									style={{
										width: extraMarker?.customMarker?.width || 30,
										height: extraMarker?.customMarker?.height || 30,
									}}
									resizeMode="contain"
								/>
							) : null}
						</Marker>


					)
				})}

				{routes.filter((route, index) => index !== selectedRouteIndex).map((route, index) => (
					<Polyline
						key={routes.indexOf(route)}
						coordinates={route.coordinates}
						strokeWidth={4}
						strokeColor={notselectedRouteColor}
						tappable
						onPress={() => {
							setSelectedRouteIndex(routes.indexOf(route));
						}}
					/>
				))}
				<Polyline
					key={selectedRouteIndex}
					coordinates={routes[selectedRouteIndex].coordinates}
					strokeWidth={4}
					strokeColor={selectedRouteColor}
				/>



			</MapView>
		</View>
	);
};

MapViewDirectionsRoutesAPI.propTypes = {
	origin: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.shape({
			latitude: PropTypes.number.isRequired,
			longitude: PropTypes.number.isRequired,
		}),
	]),
	destination: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.shape({
			latitude: PropTypes.number.isRequired,
			longitude: PropTypes.number.isRequired,
		}),
	]),
	intermediates: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				latitude: PropTypes.number.isRequired,
				longitude: PropTypes.number.isRequired,
			}),
		]),
	).isRequired,
	intermediates: (props, propName, componentName) => {
		if (props[propName] && props[propName].length > 25) {
			return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Maximum 25 elements allowed.`);
		}
	},
	extraMarkers: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				latitude: PropTypes.number.isRequired,
				longitude: PropTypes.number.isRequired,
			}),
		]),
	),
	fitToCoordinates: PropTypes.shape({
		edgePadding: PropTypes.shape({
			top: PropTypes.number.isRequired,
			right: PropTypes.number.isRequired,
			bottom: PropTypes.number.isRequired,
			left: PropTypes.number.isRequired,
		}).isRequired,
		animated: PropTypes.bool.isRequired,
	}),
	apikey: PropTypes.string.isRequired,
	onStart: PropTypes.func,
	onReady: PropTypes.func,
	onError: PropTypes.func,
	onSelectRoute: PropTypes.func,
	mode: PropTypes.oneOf(['DRIVE', 'WALK', 'TWO_WHEELER', 'BICYCLE', 'TRANSIT']),
	languageCode: PropTypes.string,
	resetOnChange: PropTypes.bool,
	optimizeWaypoints: PropTypes.bool,
	// splitWaypoints: PropTypes.bool,
	directionsServiceBaseUrl: PropTypes.string,
	region: PropTypes.string,
	selectedRouteColor: PropTypes.string,
	notselectedRouteColor: PropTypes.string,
	precision: PropTypes.oneOf(['high', 'low']),
	timePrecision: PropTypes.string,
	channel: PropTypes.string,
	fieldMask: PropTypes.string,
	computeAlternativeRoutes: PropTypes.bool,
	routingPreference: PropTypes.oneOf(['TRAFFIC_AWARE', 'TRAFFIC_UNAWARE', 'TRAFFIC_AWARE_OPTIMAL']),
	units: PropTypes.oneOf(['METRIC', 'IMPERIAL']),
	// optimizeWaypointOrder: PropTypes.bool,
	polylineQuality: PropTypes.oneOf(['OVERVIEW', 'HIGH_QUALITY']),
	polylineEncoding: PropTypes.oneOf(['ENCODED_POLYLINE', 'GEO_JSON_LINESTRING']),
	requestedReferenceRoutes: PropTypes.oneOf(['FUEL_EFFICIENT', 'SHORTER_DISTANCE']),
	extraComputations: PropTypes.arrayOf(PropTypes.oneOf([
		'TOLLS',
		'FUEL_CONSUMPTION',
		'TRAFFIC_ON_POLYLINE',
		'HTML_FORMATTED_NAVIGATION_INSTRUCTIONS',
		'FLYOVER_INFO_ON_POLYLINE',
		'NARROW_ROAD_INFO_ON_POLYLINE',
	])),
	// trafficModel: PropTypes.oneOf(['BEST_GUESS', 'PESSIMISTIC', 'OPTIMISTIC']),
	transitPreferences: PropTypes.shape({
		allowedTravelModes: PropTypes.arrayOf(PropTypes.oneOf([
			'BUS',
			'SUBWAY',
			'TRAIN',
			'LIGHT_RAIL',
			'RAIL',
		])),
		routingPreference: PropTypes.oneOf([
			'TRANSIT_ROUTING_PREFERENCE_UNSPECIFIED',
			'LESS_WALKING',
			'FEWER_TRANSFERS',
		]),
	}),
	routeModifiers: PropTypes.shape({
		avoidTolls: PropTypes.bool,
		avoidHighways: PropTypes.bool,
		avoidFerries: PropTypes.bool,
		avoidIndoor: PropTypes.bool,
		vehicleInfo: PropTypes.shape({
			emissionType: PropTypes.oneOf([
				'GASOLINE',
				'ELECTRIC',
				'HYBRID',
				'DIESEL',
			]),
		}),
		tollPasses: PropTypes.arrayOf(PropTypes.oneOf([
			'AU_ETOLL_TAG',
			'AU_EWAY_TAG',
			'AU_LINKT',
			'AR_TELEPASE',
			'BR_AUTO_EXPRESO',
			'BR_CONECTCAR',
			'BR_MOVE_MAIS',
			'BR_PASSA_RAPIDO',
			'BR_SEM_PARAR',
			'BR_TAGGY',
			'BR_VELOE',
			'CA_US_AKWASASNE_SEAWAY_CORPORATE_CARD',
			'CA_US_AKWASASNE_SEAWAY_TRANSIT_CARD',
			'CA_US_BLUE_WATER_EDGE_PASS',
			'CA_US_CONNEXION',
			'CA_US_NEXUS_CARD',
			'ID_E_TOLL',
			'IN_FASTAG',
			'IN_LOCAL_HP_PLATE_EXEMPT',
			'JP_ETC',
			'JP_ETC2',
			'MX_IAVE',
			'MX_PASE',
			'MX_QUICKPASS',
			'MX_SISTEMA_TELEPEAJE_CHIHUAHUA',
			'MX_TAG_IAVE',
			'MX_TAG_TELEVIA',
			'MX_TELEVIA',
			'MX_VIAPASS',
			'US_AL_FREEDOM_PASS',
			'US_AK_ANTON_ANDERSON_TUNNEL_BOOK_OF_10_TICKETS',
			'US_CA_FASTRAK',
			'US_CA_FASTRAK_CAV_STICKER',
			'US_CO_EXPRESSTOLL',
			'US_CO_GO_PASS',
			'US_DE_EZPASSDE',
			'US_FL_BOB_SIKES_TOLL_BRIDGE_PASS',
			'US_FL_DUNES_COMMUNITY_DEVELOPMENT_DISTRICT_EXPRESSCARD',
			'US_FL_EPASS',
			'US_FL_GIBA_TOLL_PASS',
			'US_FL_LEEWAY',
			'US_FL_SUNPASS',
			'US_FL_SUNPASS_PRO',
			'US_IL_EZPASSIL',
			'US_IL_IPASS',
			'US_IN_EZPASSIN',
			'US_KS_BESTPASS_HORIZON',
			'US_KS_KTAG',
			'US_KS_NATIONALPASS',
			'US_KS_PREPASS_ELITEPASS',
			'US_KY_RIVERLINK',
			'US_LA_GEAUXPASS',
			'US_LA_TOLL_TAG',
			'US_MA_EZPASSMA',
			'US_MD_EZPASSMD',
			'US_ME_EZPASSME',
			'US_MI_AMBASSADOR_BRIDGE_PREMIER_COMMUTER_CARD',
			'US_MI_BCPASS',
			'US_MI_GROSSE_ILE_TOLL_BRIDGE_PASS_TAG',
			'US_MI_IQ_TAG',
			'US_MI_MACKINAC_BRIDGE_MAC_PASS',
			'US_MI_NEXPRESS_TOLL',
			'US_MN_EZPASSMN',
			'US_NC_EZPASSNC',
			'US_NC_PEACH_PASS',
			'US_NC_QUICK_PASS',
			'US_NH_EZPASSNH',
			'US_NJ_DOWNBEACH_EXPRESS_PASS',
			'US_NJ_EZPASSNJ',
			'US_NY_EXPRESSPASS',
			'US_NY_EZPASSNY',
			'US_OH_EZPASSOH',
			'US_PA_EZPASSPA',
			'US_RI_EZPASSRI',
			'US_SC_PALPASS',
			'US_TX_AVI_TAG',
			'US_TX_BANCPASS',
			'US_TX_DEL_RIO_PASS',
			'US_TX_EFAST_PASS',
			'US_TX_EAGLE_PASS_EXPRESS_CARD',
			'US_TX_EPTOLL',
			'US_TX_EZ_CROSS',
			'US_TX_EZTAG',
			'US_TX_FUEGO_TAG',
			'US_TX_LAREDO_TRADE_TAG',
			'US_TX_PLUSPASS',
			'US_TX_TOLLTAG',
			'US_TX_TXTAG',
			'US_TX_XPRESS_CARD',
			'US_UT_ADAMS_AVE_PARKWAY_EXPRESSCARD',
			'US_VA_EZPASSVA',
			'US_WA_BREEZEBY',
			'US_WA_GOOD_TO_GO',
			'US_WV_EZPASSWV',
			'US_WV_MEMORIAL_BRIDGE_TICKETS',
			'US_WV_MOV_PASS',
			'US_WV_NEWELL_TOLL_BRIDGE_TICKET',
		])),
	})
};

//TOLL PASSES EXTENDED INFO
/**
 * 
 * AU_ETOLL_TAG	Sydney toll pass. See additional details at https://www.myetoll.com.au.
AU_EWAY_TAG	Sydney toll pass. See additional details at https://www.tollpay.com.au.
AU_LINKT	Australia-wide toll pass. See additional details at https://www.linkt.com.au/.
AR_TELEPASE	Argentina toll pass. See additional details at https://telepase.com.ar
BR_AUTO_EXPRESO	Brazil toll pass. See additional details at https://www.autoexpreso.com
BR_CONECTCAR	Brazil toll pass. See additional details at https://conectcar.com.
BR_MOVE_MAIS	Brazil toll pass. See additional details at https://movemais.com.
BR_PASSA_RAPIDO	Brazil toll pass. See additional details at https://pasorapido.gob.do/
BR_SEM_PARAR	Brazil toll pass. See additional details at https://www.semparar.com.br.
BR_TAGGY	Brazil toll pass. See additional details at https://taggy.com.br.
BR_VELOE	Brazil toll pass. See additional details at https://veloe.com.br/site/onde-usar.
CA_US_AKWASASNE_SEAWAY_CORPORATE_CARD	Canada to United States border crossing.
CA_US_AKWASASNE_SEAWAY_TRANSIT_CARD	Canada to United States border crossing.
CA_US_BLUE_WATER_EDGE_PASS	Ontario, Canada to Michigan, United States border crossing.
CA_US_CONNEXION	Ontario, Canada to Michigan, United States border crossing.
CA_US_NEXUS_CARD	Canada to United States border crossing.
ID_E_TOLL	Indonesia. E-card provided by multiple banks used to pay for tolls. All e-cards via banks are charged the same so only one enum value is needed. E.g. - Bank Mandiri https://www.bankmandiri.co.id/e-money - BCA https://www.bca.co.id/flazz - BNI https://www.bni.co.id/id-id/ebanking/tapcash
IN_FASTAG	India.
IN_LOCAL_HP_PLATE_EXEMPT	India, HP state plate exemption.
JP_ETC	Japan ETC. Electronic wireless system to collect tolls. https://www.go-etc.jp/
JP_ETC2	Japan ETC2.0. New version of ETC with further discount and bidirectional communication between devices on vehicles and antennas on the road. https://www.go-etc.jp/etc2/index.html
MX_IAVE	Mexico toll pass. https://iave.capufe.gob.mx/#/
MX_PASE	Mexico https://www.pase.com.mx
MX_QUICKPASS	Mexico https://operadoravial.com/quick-pass/
MX_SISTEMA_TELEPEAJE_CHIHUAHUA	http://appsh.chihuahua.gob.mx/transparencia/?doc=/ingresos/TelepeajeFormato4.pdf
MX_TAG_IAVE	Mexico
MX_TAG_TELEVIA	Mexico toll pass company. One of many operating in Mexico City. See additional details at https://www.televia.com.mx.
MX_TELEVIA	Mexico toll pass company. One of many operating in Mexico City. https://www.televia.com.mx
MX_VIAPASS	Mexico toll pass. See additional details at https://www.viapass.com.mx/viapass/web_home.aspx.
US_AL_FREEDOM_PASS	AL, USA.
US_AK_ANTON_ANDERSON_TUNNEL_BOOK_OF_10_TICKETS	AK, USA.
US_CA_FASTRAK	CA, USA.
US_CA_FASTRAK_CAV_STICKER	Indicates driver has any FasTrak pass in addition to the DMV issued Clean Air Vehicle (CAV) sticker. https://www.bayareafastrak.org/en/guide/doINeedFlex.shtml
US_CO_EXPRESSTOLL	CO, USA.
US_CO_GO_PASS	CO, USA.
US_DE_EZPASSDE	DE, USA.
US_FL_BOB_SIKES_TOLL_BRIDGE_PASS	FL, USA.
US_FL_DUNES_COMMUNITY_DEVELOPMENT_DISTRICT_EXPRESSCARD	FL, USA.
US_FL_EPASS	FL, USA.
US_FL_GIBA_TOLL_PASS	FL, USA.
US_FL_LEEWAY	FL, USA.
US_FL_SUNPASS	FL, USA.
US_FL_SUNPASS_PRO	FL, USA.
US_IL_EZPASSIL	IL, USA.
US_IL_IPASS	IL, USA.
US_IN_EZPASSIN	IN, USA.
US_KS_BESTPASS_HORIZON	KS, USA.
US_KS_KTAG	KS, USA.
US_KS_NATIONALPASS	KS, USA.
US_KS_PREPASS_ELITEPASS	KS, USA.
US_KY_RIVERLINK	KY, USA.
US_LA_GEAUXPASS	LA, USA.
US_LA_TOLL_TAG	LA, USA.
US_MA_EZPASSMA	MA, USA.
US_MD_EZPASSMD	MD, USA.
US_ME_EZPASSME	ME, USA.
US_MI_AMBASSADOR_BRIDGE_PREMIER_COMMUTER_CARD	MI, USA.
US_MI_BCPASS	MI, USA.
US_MI_GROSSE_ILE_TOLL_BRIDGE_PASS_TAG	MI, USA.
US_MI_IQ_PROX_CARD	
MI, USA. Deprecated as this pass type no longer exists.

This item is deprecated!

US_MI_IQ_TAG	MI, USA.
US_MI_MACKINAC_BRIDGE_MAC_PASS	MI, USA.
US_MI_NEXPRESS_TOLL	MI, USA.
US_MN_EZPASSMN	MN, USA.
US_NC_EZPASSNC	NC, USA.
US_NC_PEACH_PASS	NC, USA.
US_NC_QUICK_PASS	NC, USA.
US_NH_EZPASSNH	NH, USA.
US_NJ_DOWNBEACH_EXPRESS_PASS	NJ, USA.
US_NJ_EZPASSNJ	NJ, USA.
US_NY_EXPRESSPASS	NY, USA.
US_NY_EZPASSNY	NY, USA.
US_OH_EZPASSOH	OH, USA.
US_PA_EZPASSPA	PA, USA.
US_RI_EZPASSRI	RI, USA.
US_SC_PALPASS	SC, USA.
US_TX_AVI_TAG	TX, USA.
US_TX_BANCPASS	TX, USA.
US_TX_DEL_RIO_PASS	TX, USA.
US_TX_EFAST_PASS	TX, USA.
US_TX_EAGLE_PASS_EXPRESS_CARD	TX, USA.
US_TX_EPTOLL	TX, USA.
US_TX_EZ_CROSS	TX, USA.
US_TX_EZTAG	TX, USA.
US_TX_FUEGO_TAG	TX, USA.
US_TX_LAREDO_TRADE_TAG	TX, USA.
US_TX_PLUSPASS	TX, USA.
US_TX_TOLLTAG	TX, USA.
US_TX_TXTAG	TX, USA.
US_TX_XPRESS_CARD	TX, USA.
US_UT_ADAMS_AVE_PARKWAY_EXPRESSCARD	UT, USA.
US_VA_EZPASSVA	VA, USA.
US_WA_BREEZEBY	WA, USA.
US_WA_GOOD_TO_GO	WA, USA.
US_WV_EZPASSWV	WV, USA.
US_WV_MEMORIAL_BRIDGE_TICKETS	WV, USA.
US_WV_MOV_PASS	WV, USA
US_WV_NEWELL_TOLL_BRIDGE_TICKET	WV, USA.
 */

export default MapViewDirectionsRoutesAPI;