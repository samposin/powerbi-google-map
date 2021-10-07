import React from "react";
import MarkerClusterer from '@google/markerclusterer'
import powerbi from 'powerbi-visuals-api';
import ISelectionId = powerbi.visuals.ISelectionId;

export interface State {
  rows:any;
  table:any;
  columns:any;
  myCustomObject:any;
}

export const initialState: any = {
  rows:[],
  table:[],
  columns:[],
  myCustomObject:{},
  icon: "https://maps.google.com/mapfiles/ms/micons/green.png",
  icon2: "https://maps.google.com/mapfiles/ms/micons/red.png",
  activeMarker: null,
};

const containerStyle = {
  width: "100%",
  height: "100%",
  padding: 0,
  margin: 0
};
const center =  { lat: 38.60916147458761, lng: -98.0729480089214}

const options = {
  imagePath:
    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    maxZoom:13,
    gridSize: 90,
};
 
  export class Map extends React.Component<any, any> {
    // @ts-ignore
    public map: google.maps.Map; public markers: google.maps.Marker[] = [];
    public markerClusterer:any;

  constructor(props: any) {
    super(props);
    this.state = initialState;
    this.map = null;
    this.onScriptLoad = this.onScriptLoad.bind(this);
    this.loadGoogleScript = this.loadGoogleScript.bind(this);
    
  }

  private static updateCallback: (data: object) => void = null;

  public static update(newState: State) {
    if (typeof Map.updateCallback === "function") {
      Map.updateCallback(newState);
    }
  }

  public state:any = initialState;

  onScriptLoad(){
    document.getElementById('map').innerHTML = '';
    //@ts-ignore
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, { center: { lat: 38.60916147458761, lng: -98.0729480089214 }, zoom: 4 });
    this.setState({ mapLoaded: true });
    this.map.addListener('zoom_changed',() => {
      var zoomLevel = this.map.getZoom();
      console.log("zoom", zoomLevel);
    });
  }

    // Sets the map on all markers in the array.
    //@ts-ignore
    setMapOnAll(map: google.maps.Map | null) {
      for (let i = 0; i < this.markers.length; i++) {
        if(this.markers[i] === undefined) continue;
        this.markers[i].setMap(map);
      }
    }
  
    showMarkersAndDrawCluster(){
      const { rows, columns, myCustomObject, table } = this.state;
      if(this.map === null) return;
      this.setMapOnAll(null);//possible null or map
      this.markers = []
      this.markerClusterer?.clearMarkers();
      var markers = [];
      //@ts-ignore
      const infowindow = new google.maps.InfoWindow(); var bounds = new google.maps.LatLngBounds();
      rows.map((obj, index, map = this.map) => {  
        if( obj[0] !== null && obj[0] !== undefined && obj[1] !== null && obj[1] !== undefined){
            const selection: ISelectionId = this.props.host.createSelectionIdBuilder()
            .withTable(table, index)
            .createSelectionId();
            
            bounds.extend({ lat: obj[0], lng: obj[1] });
            //@ts-ignore
            var latLng = new google.maps.LatLng(obj[0], obj[1])
            //@ts-ignore
            var marker = new window.google.maps.Marker({
                position: latLng,
                icon: (obj[2] === "Active" && (myCustomObject?.activeStatus === "" ? "https://maps.google.com/mapfiles/ms/micons/green.png" : myCustomObject?.activeStatus) ) ||
                (obj[2] === "Inactive" && (myCustomObject?.inActiveStatus === "" ? "https://maps.google.com/mapfiles/ms/micons/red.png" : myCustomObject?.inActiveStatus) )
            });
            
          var contentString = "<div>";
          columns?.map((res21, counter1) => {
            if( obj[counter1] === 'NULL' || obj[counter1] === 0 || obj[counter1] === null || counter1 < 3 )
            return;
            contentString += "<div class='boldText'><span style='font-weight: normal'>"+ columns[counter1].displayName+ "</span>&nbsp;"+ obj[counter1]+ "</div>";
          });
          contentString += "</div>";
  
          marker.addListener("click", () => {
            this.props.selectionManager.select(selection);
          });
  
          marker.addListener('rightclick', (e:any) => {
              // @ts-ignore
              let p = this.props.selectionManager.showContextMenu(selection, {
                x: e.domEvent.clientX,
                y: e.domEvent.clientY
              });
          });
  
        marker.addListener('mouseover', () => {
          infowindow.setContent(contentString);
          infowindow.open({
            //@ts-ignore
            anchor: marker,
            map: map,
            position: latLng,
            shouldFocus: false,
          });
        });
        
        // assuming you also want to hide the infowindow when user mouses-out
        marker.addListener('mouseout', () => {
            infowindow.close();
        });
  
        markers.push(marker);
    
        }
      });
    this.markers = markers;
    this.map.fitBounds(bounds);
    setTimeout(() => {
      this.markerClusterer = new MarkerClusterer(this.map, markers, {
        imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        maxZoom:13,
        gridSize: 90,
        minimumClusterSize:2
      });

      // this.map.setZoom(this.map.getZoom()+ 0.01);
    }, 1000);
  }

  public componentDidUpdate(){
    this.showMarkersAndDrawCluster();
  }

  loadGoogleScript(token){
    var googleScript = document.getElementById('googleScript');
        googleScript?.remove();
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.id = 'googleScript';
        s.src =  `https://maps.google.com/maps/api/js?key=${token}`
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
        // Below is important. 
        //We cannot access google.maps until it's finished loading
        s.addEventListener('load', e => {
          this.onScriptLoad()
        });
  }

  public componentDidMount() {
    //@ts-ignore
    if (!window.google) {

      this.loadGoogleScript(this.state.myCustomObject.token);
      
      const script = document.createElement('script')
      script.src = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'
      script.async = true
      document.body.appendChild(script);
    
    } else {
      this.onScriptLoad()
    }

    Map.updateCallback = (newState: State): void => {
      if(this.state.myCustomObject.token !== newState.myCustomObject.token){
        this.loadGoogleScript(newState.myCustomObject.token);
      }
      this.setState(newState);
    };
  }

  public componentWillUnmount() {
    Map.updateCallback = null;
  }

  render() {
    return (<><div style={containerStyle} id="map" /><div className='logo-container' /></>);
  }
}

export default Map;