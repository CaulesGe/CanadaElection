export const DetailModal = ({ data, onClose, regionName }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{regionName} – All Parties</h2>
          <table>
            <thead>
              <tr>
                <th>Party</th>
                <th>Votes</th>
                <th>% of Vote</th>
              </tr>
            </thead>
            <tbody>
              {data.map((party, idx) => (
                <tr key={idx}>
                  <td>{party.party}</td>
                  <td>{party.numberOfVote.toLocaleString()}</td>
                  <td>{party.percentageOfVote.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };
  