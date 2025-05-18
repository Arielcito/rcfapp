
import axios from 'axios'

const BASE_URL="https://places.googleapis.com/v1/places:searchNearby";
const API_KEY= "AIzaSyDiNmgWgB0CGoM1EG6CT846M83bpRdso-Q";
const FIREBASE_API= "AIzaSyC63HcJiZPxNDxCSwFm0258ctV0ILQDjRc";
const configMaps={
    headers:{
        'Content-Type':'application/json',
        'X-Goog-Api-Key':API_KEY,
        'X-Goog-FieldMask':[
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.evChargeOptions',
    'places.shortFormattedAddress',
    'places.photos','places.id']
    }
}
// https://developers.google.com/maps/documentation/places/web-service/search-nearby?hl=es-419
const NewNearByPlace=(data)=>axios.post(BASE_URL,data,configMaps);

export default{
    NewNearByPlace,
    API_KEY,
    FIREBASE_API
}
