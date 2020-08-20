export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Fzc2VyIiwiYSI6ImNrZHZ4N2tvdDBqZm4ycnFpdmU1dnAxYnIifQ.HqlkPdsc9yULVMSjT5mOPA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/gasser/ckdw0sc2x23lo19paquvkkfct', 
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl.Popup({ offset: 30 })
            .setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200, bottom: 150, left: 100, right: 100
        }
    });
}