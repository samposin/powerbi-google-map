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

import { Card, Container, Typography } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Button from "@material-ui/core/Button";

const containerStyle = {
  width: "100%",
  height: "100vh",
};
const center = { lat: 41.7609023, lng: -72.7424573 };

const options = {
  imagePath:
    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
};

function createKey(location) {
  return location.lat + location.lng;
}

const modalStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 2),
    },
    button: {
      display: "flex",
      justifyContent: "flex-end",
    },
  })
);

const toolTipStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 10,
    },
    button: {
      width: 120,
      padding: 5,
      alignSelf: "flex-end",
      marginRight: 10,
    },
    boldText: {
      fontWeight: "bold",
    },
  })
);

const Map = (props: any) => {
  const modalClasses = modalStyles();
  const toolTipClasses = toolTipStyles();

  const [locations, setlocations] = useState([]);
  const [token, setToken] = useState("");
  const [activeMarker, setActiveMarker] = useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalData, setModalData] = React.useState([]);
  const [icon, setIcon] = useState("");

  const mapRef = useRef<google.maps.Map<Element> | null>(null);

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
      if (
        props?.myCustomObject?.iconURL !== undefined &&
        props?.myCustomObject?.iconURL !== icon
      ) {
        setIcon(props?.myCustomObject?.iconURL);
        // clearInterval(Interval);
      } else {
        if (icon !== "") setIcon("");
        setlocations(props.rows);
      }
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
    setModalData([]);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setActiveMarker(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalData([]);
  };

  const showModal = () => {
    // const result = locations.filter((res, index) => {
    //   if (activeMarker === index) {
    //     return res;
    //   }
    //   return null;
    // });
    return (
      <Card>
        {modalData !== null
          ? modalData.map((res) => {
              return (
                <div>
                  <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    className={modalClasses.modal}
                    key={activeMarker}
                    open={openModal}
                    // onClose={handleClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                      timeout: 500,
                    }}
                  >
                    <Fade in={openModal}>
                      <div className={modalClasses.paper}>
                        {modalData !== null &&
                          props.columns.map((res1, counter) => {
                            return (
                              <p style={{ margin: 0 }}>
                                {props.columns[counter].displayName}:{" "}
                                <span style={{ fontWeight: "normal" }}>
                                  {modalData[0][counter]}
                                </span>
                              </p>
                            );
                          })}
                        <div className={modalClasses.button}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCloseModal}
                          >
                            OK
                          </Button>
                        </div>
                      </div>
                    </Fade>
                  </Modal>
                </div>
              );
            })
          : null}
      </Card>
    );
  };

  return (
    <>
      {token !== "" ? (
        <LoadScript googleMapsApiKey={props?.myCustomObject?.token}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={3}
            id="map"
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
                        url:
                          (props?.myCustomObject?.iconURL != "" &&
                            props?.myCustomObject?.iconURL) ||
                          (obj[3] === "Active" &&
                            "https://maps.google.com/mapfiles/ms/micons/green.png") ||
                          (obj[3] === "Inactive" &&
                            "https://maps.google.com/mapfiles/ms/micons/red.png"),
                        scaledSize: new google.maps.Size(30, 30),
                      }}
                      clusterer={clusterer}
                      onMouseOver={() => {
                        handleActiveMarker(index);
                        setModalData([obj]);
                      }}
                      // onMouseOut={closeInfoWindow}
                      onClick={ () => {
                        props.selectionManager.select(selection);
                      }}
                      onRightClick={(e: any)=> {
                        // @ts-ignore
                       let p = props.selectionManager.showContextMenu(selection, {
                            x: e.domEvent.clientX,
                            y: e.domEvent.clientY
                        });
                        console.log(selection)
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
                              {modalData !== null &&
                                props.columns.map((res21, counter1) => {
                                  if( obj[counter1] === 'NULL' || counter1 < 4 )
                                  return;                               
                                  return (
                                    <Typography className={toolTipClasses.boldText}>
                                      {props.columns[counter1].displayName}:{" "}
                                      <span style={{ fontWeight: "normal" }}>
                                        {obj[counter1]}
                                      </span>
                                    </Typography>
                                  );
                                })}
                                </div>
                            </Container>
                            <Button
                              className={toolTipClasses.button}
                              variant="contained"
                              onClick={handleOpenModal}
                              color="primary"
                              disableRipple
                            >
                              show more
                            </Button>
                          </div>
                        </InfoWindow>
                      ) : null}
                    </Marker>
                  );
                })
              }
            </MarkerClusterer>
            {showModal()}
          </GoogleMap>
        </LoadScript>
      ) : (
        <div className="tokenMsgWrapper">
          <h3 className="red">Google Map Api Token is required!</h3>
          <ul className="ulStyled">
            <li>Click on format icon</li>
            <li>Expand the google map settings</li>
            <li>paste your api token in token field.</li>
          </ul>
        </div>
      )}
    </>
  );
};
export default Map;
