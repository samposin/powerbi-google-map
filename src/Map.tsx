import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import { ATM, Office, thirdparty } from './images'

const containerStyle = {
    width: '100%',
    height: '100vh',
};
const center = { lat:41.7609023, lng:	-72.7424573 };


const options = {
  imagePath:
    'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
};

function createKey(location) {
  return location.lat + location.lng;
}

const Map = (props: any) => {

  const [locations, setlocations] = useState([]);
  const [token, setToken] = useState('');

  const mapRef = useRef<google.maps.Map<Element> | null>(null);

  useEffect(() => {
    var Interval = setInterval(function(){ 
      if(typeof(props?.myCustomObject?.token) !== 'undefined'){
        setToken(props?.myCustomObject?.token);
      }
      console.log('interval running!');
      // console.log("useeffect", (typeof(props?.myCustomObject?.token) !== 'undefined') ); 
    }, 3000)
    return ()=> clearInterval(Interval);;
    // setlocations(props.rows);
  }, []);

  useEffect(() => {
    setlocations(props.rows);
  }, [props.rows]);

  return (<>{ (token !== '') ? 
    <LoadScript
      googleMapsApiKey={props?.myCustomObject?.token}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={3}
        id="map"
      >
      <MarkerClusterer options={options}>
        {(clusterer) =>
          locations?.length > 0 && locations.map(( obj,index ) => {
            // @ts-ignore
            let selectionID: ISelectionID = props.host.createSelectionIdBuilder()
            .withCategory(obj, index)
            .createSelectionId();
            var len = obj.length;
            return <Marker
              key={createKey(obj)}
              position={ { lat: obj[len - 2], lng:obj[len - 1] } }
              icon={{url: props?.myCustomObject?.iconURL != '' && props?.myCustomObject?.iconURL || obj[len-3] === "ATM" && ATM || obj[len-3] === "Office" && Office || obj[len-3] === "DataCenter" && thirdparty, scaledSize: new google.maps.Size(30, 30)}}
              clusterer={clusterer}
              onClick={(e: any)=>{
                var toolTipHtml = '';
                for (let i = 0; i < len -3; i++) {
                  toolTipHtml += obj[i]+"<br/>";
                  
                }
                var d = document.createElement('p');
                var map =document.getElementById('map');
                d.setAttribute("id", "custom-tool-tip");
                d.style.position = "absolute";
                d.innerHTML = toolTipHtml;//obj[0];
                d.style.left = e.domEvent.clientX+'px';
                d.style.top = e.domEvent.clientY+'px';
                

                let btn = document.createElement("button");
                btn.innerHTML = "Drill Through";
                btn.type = "button";

                btn.onclick = function () {
                  console.log("Button is clicked");
                };
                
                d.appendChild(btn);
                
                map.appendChild(d);
                console.log(len);
              }}

              onRightClick={(e: any)=> {
                // @ts-ignore
               let p = props.selectionManager.showContextMenu(selectionID, {
                    x: e.domEvent.clientX,
                    y: e.domEvent.clientY
                });
              }}             
            />;
          }
          )
        }
      </MarkerClusterer>
      </GoogleMap>
    </LoadScript> : <div className="tokenMsgWrapper">
        <h3 className="red">Google Map Api Token is required!</h3>
        <ul className="ulStyled">
            <li>Click on format icon</li>
            <li>Expand the google map settings</li>
            <li>paste your api token in token field.</li>
        </ul>
        </div> }
  </>);
};
export default Map;