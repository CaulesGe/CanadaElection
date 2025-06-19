import ElectionMap from './map.js';
import VoteOverview from './voteOverview.js';
import SeatOverview from './seatOverview.js';

Promise.all([d3.json('data/CA2021/2021result.json'), d3.json('data/CA2021/percentageOfVoteByRegion.json'), d3.json('data/CA2021/numberOfVoteByRegion.json'),
    d3.json('data/CA2021/resultByDistrict.json')
])
.then(([ridingResult, percentageOfVoteByRegion, numberOfVoteByRegion, resultByDistrict]) => {
    let map = new ElectionMap('map', ridingResult);
    let seatOverview = new SeatOverview('overview-chart', resultByDistrict);
    let overview = new VoteOverview('overview-chart', percentageOfVoteByRegion, numberOfVoteByRegion, resultByDistrict);
    
    document.getElementById("regionSelector").addEventListener("change", function() {
    const selected = this.value;
    overview.updateRegion(selected);
    seatOverview.updateRegion(selected);
});

})

