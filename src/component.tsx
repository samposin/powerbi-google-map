import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
// @ts-ignore
import mapboxgl from '!mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// import './App.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGlsZGFyLWtoYW4iLCJhIjoiY2tvMTIwbWJ0MDB0ajJ3cnhhaHE4MG92aiJ9.ajrhjtmBCAx63TUn1w8sRw';

function ReactCircleCard() {
  //   return <div className='circleCard'>Hello, React!</div>;
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      const centerLNG: any = map.current?.getCenter().lng.toFixed(4);
      const centerLAT: any = map.current?.getCenter().lat.toFixed(4);
      const zoom: any = map.current?.getZoom().toFixed(2);
      setLng(centerLNG);
      setLat(centerLAT);
      setZoom(zoom);
    });
  });

  return (
    <div>
      <div className='sidebar'>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className='map-container' />
    </div>
  );
}

export default ReactCircleCard;
