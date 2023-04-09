/* eslint-disable*/

export const displayMap = (locations) => {
  var map = tt.map({
    key: 'aswuJFdV8UlNpye0AEuR9AA81M8gCZ8R',
    container: 'map',
    style:
      'https://api.tomtom.com/style/1/style/21.1.0-*/?map=basic_main-lite&poi=poi_main',
    scrollZoom: false,
  });

  const bounds = new tt.LngLatBounds();

  locations.forEach((location) => {
    const newMarker = document.createElement('div');
    newMarker.className = 'marker';

    new tt.Marker({
      element: newMarker,
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new tt.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 250, bottom: 150, left: 50, right: 50 },
  });
};
