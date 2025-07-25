//import "./HistoricalSeatsTable.css"

export const HistoricalVoteTable = ({ selectedElectionData, year, parties }) => {

    // Sort parties by seat count descending
    const sortedParties = parties.filter(party => party in selectedElectionData)
        .sort((a, b) => {
            const voteA = selectedElectionData[a].numberOfVote || 0;
            const voteB = selectedElectionData[b].numberOfVote || 0;
            return voteB - voteA; // descending order
        })
        .filter(p => {
            const vote = selectedElectionData[p].numberOfVote;
            return vote && vote > 0;
        });

    return (
        <div className="seatsTable">
        <h2>Selected Details</h2>
        <table>
            <thead>
            <tr>
                <th>Party</th>
                <th>Year</th>
                <th>Vote</th>
                <th>Share</th>
            </tr>
            </thead>
            <tbody>
           {sortedParties
                .map((party, idx) => (
                    <tr key={idx}>
                    <td>{party}</td>
                    <td>{year}</td>
                    <td>{selectedElectionData[party].numberOfVote}</td>
                    <td>{selectedElectionData[party].percentageOfVote}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
};