/// <reference types="googlemaps" />
import React from "react";
export interface State {
    rows: any;
    table: any;
    columns: any;
    myCustomObject: any;
}
export declare const initialState: any;
export declare class Map extends React.Component<any, any> {
    map: google.maps.Map;
    markers: google.maps.Marker[];
    markerClusterer: any;
    constructor(props: any);
    private static updateCallback;
    static update(newState: State): void;
    state: any;
    onScriptLoad(): void;
    setMapOnAll(map: google.maps.Map | null): void;
    showMarkersAndDrawCluster(): void;
    componentDidUpdate(): void;
    loadGoogleScript(token: any): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
export default Map;
