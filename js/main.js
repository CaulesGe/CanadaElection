import electionMap from './map.js';


d3.json('data/2011result.json').then(data => {

    let map = new electionMap('map', data);
})

