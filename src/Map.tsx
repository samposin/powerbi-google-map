import React, { useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
  MarkerClusterer,
} from "@react-google-maps/api";
import { ATM, Office, thirdparty } from "./images";

import powerbi from 'powerbi-visuals-api';
import DataViewTableRow = powerbi.DataViewTableRow;
import ISelectionId = powerbi.visuals.ISelectionId;

import { Container, Typography } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";


const containerStyle = {
  width: "100%",
  height: "100vh",
};
const center =  { lat: 31.53742365481714, lng: -90.81904175892141}

const options = {
  imagePath:
    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    maxZoom:13,
};

function createKey(location) {
  return location.lat + location.lng;
}

const toolTipStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 10,
      fontFamily: 'Poppin'
    },
    boldText: {
      fontWeight: "bold",
    },
  })
);

const Map = (props: any) => {
  const toolTipClasses = toolTipStyles();

  const [locations, setlocations] = useState([]);
  const [token, setToken] = useState("");
  const [activeMarker, setActiveMarker] = useState(null);

  const [icon, setIcon] = useState("");
  const [icon2, setIcon2] = useState("");

  useEffect(() => {
    var Interval = setInterval(function () {
      if (
        props?.myCustomObject?.token !== undefined &&
        props?.myCustomObject?.token !== token
      ) {
        setToken(props?.myCustomObject?.token);
        clearInterval(Interval);
      }
    }, 3000);

    var iconInterval = setInterval(function () {
        setIcon(props?.myCustomObject?.activeStatus);
        setIcon2(props?.myCustomObject?.inActiveStatus);
    }, 3000);
  }, []);

  useEffect(() => {
    setlocations(props.rows);
  }, [props.rows]);

  const handleActiveMarker = (marker: any) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const closeInfoWindow = () => {
    handleActiveMarker(null);
  };

  function handleZoomChanged() {
    console.log("current zoom", this.getZoom()); //current zoom
  }

  return (
    <>
      {token !== "" ? (
        <LoadScript googleMapsApiKey={props?.myCustomObject?.token}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={4}
            id="map"
            onZoomChanged={handleZoomChanged}
          >
            <MarkerClusterer options={options}>
              {(clusterer) =>
                locations?.length > 0 &&
                locations.map((obj, index) => {
                  var len = obj.length;
                    const selection: ISelectionId = props.host.createSelectionIdBuilder()
                        .withTable(props?.table, index)
                        .createSelectionId();
                  return (
                    <Marker
                      key={createKey(obj)}
                      position={{ lat: obj[0], lng: obj[1] }}
                      // icon={{
                      //   url:
                      //     (props?.myCustomObject?.iconURL != '' &&
                      //       props?.myCustomObject?.iconURL) ||
                      //     (obj[len - 2] === 'ATM' && ATM) ||
                      //     (obj[len - 2] === 'Office' && Office) ||
                      //     (obj[len - 2] === 'DataCenter' && thirdparty),
                      //   scaledSize: new google.maps.Size(30, 30),
                      // }}
                      

                      icon={{
                        url: (obj[2] === "Active" && icon) ||
                          (obj[2] === "Inactive" && icon2),
                        scaledSize: new google.maps.Size(30, 30),
                      }}
                      clusterer={clusterer}
                      onMouseOver={() => {
                        handleActiveMarker(index);
                      }}
                      onMouseOut={closeInfoWindow}
                      onClick={ () => {
                        props.selectionManager.select(selection);
                      }}
                      onRightClick={(e: any)=> {
                        // @ts-ignore
                       let p = props.selectionManager.showContextMenu(selection, {
                            x: e.domEvent.clientX,
                            y: e.domEvent.clientY
                        });
                      }}
                    >
                      {activeMarker === index ? (
                        <InfoWindow onCloseClick={closeInfoWindow}>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <Container
                              className={toolTipClasses.mainContainer}
                              maxWidth="sm"
                            >
                              <div style={{ marginRight: 10 }}>
                              {props?.columns?.map((res21, counter1) => {
                                  if( obj[counter1] === 'NULL' || obj[counter1] === 0 || counter1 < 3 )
                                  return;                               
                                  return (
                                    <Typography className={toolTipClasses.boldText}>
                                      <span style={{ fontWeight: "normal" }}>{props.columns[counter1].displayName}:{" "}</span>
                                      <span>
                                        {obj[counter1]}
                                      </span>
                                    </Typography>
                                  );
                                })}
                                </div>
                            </Container>
                          </div>
                        </InfoWindow>
                      ) : null}
                    </Marker>
                  );
                })
              }
            </MarkerClusterer>
          </GoogleMap>
        </LoadScript>
      ) : (<></>)}
    </>
  );
};
export default Map;
