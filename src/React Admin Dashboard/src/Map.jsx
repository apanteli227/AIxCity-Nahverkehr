import React from 'react'


//Leaflet information

/*let map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13
});

function Karte() {
    return (
        <div id="map">
        </div>  
    )
}
*/


function Karte() {
   
const position = [53.505, 8.48]
      
render(
  <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={position}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  </MapContainer>
)
}



export default Karte