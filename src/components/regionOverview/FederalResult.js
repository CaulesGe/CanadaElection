export const FederalResult = ({ selectedElection }) => {
    const trudeauTime = new Set(['2015', '2019', '2021']);
    const harperTime = new Set(['2006', '2008', '2011']);

    let pmName;
    let pmParty;

    if (trudeauTime.has(selectedElection)) {
        pmName = 'Justin Trudeau';
        pmParty = 'Liberal Party of Canada';
    } else if (harperTime.has(selectedElection)) {
        pmName = 'Stephen Harper';
        pmParty = 'Conservative Party of Canada';
    } else {
        pmName = 'Paul Martin';
        pmParty = 'Liberal Party of Canada';
    }

    return (
        <div>
        <h4>Prime Minister: {pmName} - {pmParty}</h4>
        <img
            src={`/data/${selectedElection}/PM.jpg`}
            alt="Prime Minister"
            style={{ width: '200px', height: 'auto' }}
        />
        </div>
    );
};