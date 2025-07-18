import './DetailModal.css';

export const DetailModal = ({ selectedRegionVote, selectedRegion }) => {
  return (
    <div className="modal-content">
      <h2>{selectedRegion} – All Parties</h2>
      <table>
        <thead>
          <tr>
            <th>Party</th>
            <th>Votes</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {selectedRegionVote.map((party, idx) => (
            <tr key={idx}>
              <td>{party.party}</td>
              <td>{party.numberOfVote.toLocaleString()}</td>
              <td>{party.percentageOfVote}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};