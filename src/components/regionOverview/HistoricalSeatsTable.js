import "./HistoricalSeatsTable.css"

export const HistoricalSeatsTable = ({ selectedElectionData, year, parties }) => {

    // Sort parties by seat count descending
    const sortedParties = [...parties].sort((a, b) => selectedElectionData[b] - selectedElectionData[a]).filter(p => selectedElectionData[p] > 0);

    return (
        <div className="seatsTable">
        <h2>Selected Details</h2>
        <table>
            <thead>
            <tr>
                <th>Party</th>
                <th>Year</th>
                <th>Seats</th>
            </tr>
            </thead>
            <tbody>
            {sortedParties.map((party, idx) => (
                <tr key={idx}>
                <td>{party}</td>
                <td>{year}</td>
                <td>{selectedElectionData[party]}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};