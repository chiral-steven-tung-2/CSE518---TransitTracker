export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  direction: string;
}

import { XMLParser } from 'fast-xml-parser';

const MTA_API_KEY = 'b1af2818-ea0d-4b2f-b632-5119632b6ae3';

interface StopXMLResponse {
  response: {
    data: {
      id: string;
      name: string;
      lon?: string;
      lat?: string;
      direction?: string;
      code?: string;
      locationType?: string;
    };
  };
}

const parseXML = (xml: string): StopXMLResponse => {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  return parser.parse(xml) as StopXMLResponse;
}

const fetchStopData = async (stopId: string): Promise<StopXMLResponse['response']['data']> => {
  const url = `/api/mta/api/where/stop/${stopId}.xml?key=${MTA_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const xmlData = await response.text();
    const result = parseXML(xmlData);
    return result.response.data;
  } catch (error) {
    console.error('Error fetching or parsing XML data:', error);
    throw error;
  }
}

interface ProcessedStopData {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  direction: string;
  code: string;
  locationType: string;
}

const getStopsData = async (idList: string[]): Promise<ProcessedStopData[]> => {
  const stopData: ProcessedStopData[] = [];
  for (let i = 0; i < idList.length; i++) {
    const stopId = idList[i];
    try {
      const stopInfo = await fetchStopData(stopId);
      if (stopInfo) {
        stopData.push({
          id: stopInfo.id,
          name: stopInfo.name,
          longitude: stopInfo.lon ? parseFloat(stopInfo.lon) : 0,
          latitude: stopInfo.lat ? parseFloat(stopInfo.lat) : 0,
          direction: stopInfo.direction || '',
          code: stopInfo.code || '',
          locationType: stopInfo.locationType || ''
        });
      }
    } catch (error) {
      console.error(`Error fetching data for stop ID ${stopId}:`, error);
    }
  }
  return stopData;
};

export interface CleanedBusStopsData {
  route: string;
  zeroDirDest: string;
  zeroDirStopsData: Array<{
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    direction: string;
    code: string;
    locationType: string;
  }>;
  oneDirDest: string;
  oneDirStopsData: Array<{
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    direction: string;
    code: string;
    locationType: string;
  }>;
}

interface StopsForRouteResponse {
  data: {
    entry: {
      routeId: string;
      stopGroupings: Array<{
        stopGroups: Array<{
          name: {
            name: string;
          };
          stopIds: string[];
        }>;
      }>;
    };
  };
}

export const cleanMTAStopsData = async (stopsData: StopsForRouteResponse): Promise<CleanedBusStopsData> => {
  const newStopsData: CleanedBusStopsData = {
    route: stopsData.data.entry.routeId,
    zeroDirDest: stopsData.data.entry.stopGroupings[0].stopGroups[0].name.name,
    zeroDirStopsData: [],
    oneDirDest: stopsData?.data?.entry?.stopGroupings[0]?.stopGroups[1]?.name?.name || "Refer Above (Bus is a Loop)",
    oneDirStopsData: []
  };

  const zeroDirStopsIds = stopsData.data.entry.stopGroupings[0].stopGroups[0].stopIds;
  newStopsData.zeroDirStopsData = await getStopsData(zeroDirStopsIds);
  if (stopsData?.data?.entry?.stopGroupings[0]?.stopGroups[1]?.stopIds) {
    const oneDirStopsIds = stopsData.data.entry.stopGroupings[0].stopGroups[1].stopIds;
    newStopsData.oneDirStopsData = await getStopsData(oneDirStopsIds);
  }

  return newStopsData;
};
export const fetchBusStopsData = async (busRoute: string): Promise<CleanedBusStopsData> => {
  try {
    const url = `/api/mta/api/where/stops-for-route/${encodeURIComponent(busRoute)}.json?key=${MTA_API_KEY}&includePolylines=false&version=2`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const busStopData = await response.json();
    const cleaned = await cleanMTAStopsData(busStopData);
    return cleaned;
  } catch (error) {
    console.error('Fetching bus stop data failed', error);
    throw error;
  }
}

export interface NearbyStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  direction: string;
  locationType: number;
  routes: Array<{
    id: string;
    shortName: string;
    longName: string;
    description: string;
  }>;
  distance?: number;
}

export const fetchStopsForLocation = async (
  lat: number,
  lon: number,
  radius: number = 500,
  maxResults: number = 20
): Promise<NearbyStop[]> => {
  try {
    const baseSpan = 0.005;
    const calculatedLatSpan = (radius / 111000) * 2;
    const calculatedLonSpan = (radius / (111000 * Math.cos(lat * Math.PI / 180))) * 2;
    
    const latSpan = Math.max(baseSpan, calculatedLatSpan);
    const lonSpan = Math.max(baseSpan, calculatedLonSpan);
    
    const url = `/api/mta/api/where/stops-for-location.json?lat=${lat}&lon=${lon}&latSpan=${latSpan.toFixed(6)}&lonSpan=${lonSpan.toFixed(6)}&key=${MTA_API_KEY}`;
    
    console.log('Fetching stops from:', url);
    console.log('Radius:', radius, 'meters, latSpan:', latSpan.toFixed(6), 'lonSpan:', lonSpan.toFixed(6));
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data: {
      code: string;
      currentTime: number;
      data?: {
        stops?: Array<{
          id: string;
          name: string;
          code?: string;
          lat: string;
          lon: string;
          direction?: string;
          locationType?: number;
          routes?: Array<{
            id?: string;
            shortName?: string;
            longName?: string;
            description?: string;
          }>;
        }>;
      };
    } = await response.json();
    console.log('API Response status:', data.code, 'currentTime:', data.currentTime);
    console.log('Full data structure:', data);
    console.log('data.data:', data.data);
    console.log('data.data.stops:', data.data?.stops);
    console.log('Number of stops in response:', data.data?.stops?.length || 0);
    
    if (!data.data) {
      console.error('No data.data object in response!');
      return [];
    }
    
    if (!data.data.stops) {
      console.error('No data.data.stops array in response!');
      return [];
    }
    
    if (data.data.stops.length === 0) {
      console.log('data.data.stops is empty array');
      return [];
    }
    
    // Process and clean the data
    console.log('Starting to process stops...');
    const stopsBeforeFilter = data.data.stops;
    console.log('Total stops before filtering:', stopsBeforeFilter.length);
    console.log('First stop raw data:', stopsBeforeFilter[0]);
    
    const stops: NearbyStop[] = data.data.stops
      .filter((stop) => {
        const hasCoords = stop.lat && stop.lon;
        if (!hasCoords) {
          console.log(`Stop ${stop.id} missing coordinates - lat: ${stop.lat}, lon: ${stop.lon}`);
        }
        return hasCoords;
      })
      .map((stop) => {
        const routes = (stop.routes || []).map((route) => ({
          id: route.id || '',
          shortName: route.shortName || '',
          longName: route.longName || '',
          description: route.description || ''
        }));
        const processedStop = {
          id: stop.id,
          name: stop.name,
          code: stop.code || '',
          lat: parseFloat(stop.lat),
          lon: parseFloat(stop.lon),
          direction: stop.direction || '',
          locationType: stop.locationType || 0,
          routes: routes
        };
        console.log('Processed stop:', processedStop.id, processedStop.name);
        return processedStop;
      });
    
    console.log(`Processed ${stops.length} stops with valid coordinates`);
    console.log('First processed stop:', stops[0]);
    
    const stopsWithDistance = stops.map(stop => {
      const distanceMeters = calculateDistance(lat, lon, stop.lat, stop.lon);
      const distanceMiles = distanceMeters * 0.000621371;
      return { ...stop, distance: distanceMiles };
    });
    
    console.log('Sample distances (miles):', stopsWithDistance.slice(0, 5).map(s => ({ id: s.id, distance: s.distance.toFixed(2) })));
    
    stopsWithDistance.sort((a, b) => a.distance - b.distance);
    
    const result = stopsWithDistance.slice(0, maxResults);
    
    console.log(`Returning ${result.length} closest stops (requested max: ${maxResults})`);
    
    return result;
  } catch (error) {
    console.error('Fetching stops for location failed', error);
    throw error;
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
