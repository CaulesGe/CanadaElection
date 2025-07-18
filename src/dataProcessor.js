const fs = require('fs');
const path = require('path');

const DATA_FOLDER = path.join(path.dirname(__dirname), 'public', 'data');
const ELECTIONS = ["38thCA2004", "39thCA2006", "40thCA2008", "41stCA2011", "42ndCA2015", "43rdCA2019", "44thCA2021"]; // Add all the elections you want to process

const FILES = [
  'allCandidatesResult.json',
  'resultByDistrict.json',
  'percentageOfVoteByRegion.json',
  'numberOfVoteByRegion.json'
];

// Clean function (same as in your frontend)
function cleanKeys(data) {
  return data.map(entry => {
    const cleaned = {};
    Object.entries(entry).forEach(([key, value]) => {
      const newKey = key.split('/')[0].trim();
      let newValue = value;
      if (typeof value === 'string' && value.includes('/')) {
        newValue = value.split('/')[0].trim();
      }
      cleaned[newKey] = newValue;
    });
    return cleaned;
  });
}

ELECTIONS.forEach(election => {
  FILES.forEach(fileName => {
    const filePath = path.join(DATA_FOLDER, election, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    const cleanedData = cleanKeys(parsedData);
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf-8');

    console.log(`✔ Cleaned and updated: ${filePath}`);
  });
});

const electionsPrev2007 = ["38thCA2004"];

// electionsPrev2007.forEach(election => {
//   // FILES.forEach(fileName => {
//     const filePath = path.join(DATA_FOLDER, election, 'allCandidatesResult.json');

//     if (!fs.existsSync(filePath)) {
//       console.warn(`File not found: ${filePath}`);
//       return;
//     }

//     const rawData = fs.readFileSync(filePath, 'utf-8');
//     const parsedData = JSON.parse(rawData);
//     const cleanedData = addFedID(parsedData);
//     fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf-8');

//     console.log(`✔ Cleaned and updated: ${filePath}`);
//   });
// //});

function addFedID(data) {
  const geoDataPath = path.join(DATA_FOLDER, '41stCA2011', 'riding.geojson');
  const rawGeoData = fs.readFileSync(geoDataPath, 'utf-8');
  const parsedGeoData = JSON.parse(rawGeoData);

  return data.map(entry => {
    const cleaned = {};

    // Clean up keys and values
    Object.entries(entry).forEach(([key, value]) => {
      const newKey = key.split('/')[0].trim();
      let newValue = value;
      if (typeof value === 'string' && value.includes('/')) {
        newValue = value.split('/')[0].trim();
      }
      cleaned[newKey] = newValue;
    });

    const ridingName = cleaned["Electoral District Name"];

    // Use .includes() to allow partial matches
    const matchingFeature = parsedGeoData.features.find(f => {
      const fedName = f.properties.FEDNAME;
      return ridingName == fedName;
    });

    if (matchingFeature) {
      cleaned["Electoral District Number"] = matchingFeature.properties.FEDUID;
    } else {
      console.warn(`⚠️ No match found for "${cleaned["Electoral District Name"]}"`);
    }

    return cleaned;
  });
}

function addFedIDFromAllCandidatesResult(data) {
  const geoDataPath = path.join(DATA_FOLDER, '41stCA2011', 'allCandidatesResult.json');
  const rawGeoData = fs.readFileSync(geoDataPath, 'utf-8');
  const parsedGeoData = JSON.parse(rawGeoData);

  return data.map(entry => {
    const cleaned = {};

    // Clean up keys and values
    Object.entries(entry).forEach(([key, value]) => {
      const newKey = key.split('/')[0].trim();
      let newValue = value;
      if (typeof value === 'string' && value.includes('/')) {
        newValue = value.split('/')[0].trim();
      }
      cleaned[newKey] = newValue;
    });

    const ridingName = cleaned["Electoral District Name"];

    // Use .includes() to allow partial matches
    const matchingFeature = parsedGeoData.find(f => {
      const fedName = f["Electoral District Name"];
      return ridingName.includes(fedName);
    });

    if (matchingFeature) {
      cleaned["Electoral District Number"] = matchingFeature["Electoral District Number"];
    } else {
      console.warn(`⚠️ No match found for "${cleaned["Electoral District Name"]}"`);
    }

    return cleaned;
  });
}
