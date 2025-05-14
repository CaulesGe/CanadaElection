import electionMap from './map.js';


d3.json('data/2021result.json').then(data => {
    
    let map = new electionMap('map', data);
})

