// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// [START analyticsdata_pivot_demo]
// [START analyticsdata_pivot_demo_initialize]
/**
 * TODO(developer): Replace this variable with a client ID for your web
 * application from the Google API Console:
 *
 *  https://console.developers.google.com/apis/credentials?project=_
 *
 * In your API Console project, add a JavaScript origin that corresponds
 * to the domain where you will be running the script (e.g. http://localhost:8080).
 */
const clientId =  'YOUR-CLIENT-ID';

// The Google Analytics Data API v1 discovery document url.
// See https://developers.google.com/analytics/devguides/reporting/data/v1/rest/
// for the most current url.
const discoveryDocs = ['https://analyticsdata.googleapis.com/$discovery/rest?version=v1beta'];

// Authorization scopes for the Google Analytics Data API reporting calls.
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';


const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const runQueryButton = document.getElementById('run-query-button');

function handleClientLoad() {
  // Load the API client and auth2 library
  gapi.load('client:auth2', initClient);
}

function initClient() {
  // Initialize the GAPI client and OAuth2 flow.
  gapi.client.init({
      discoveryDocs: discoveryDocs,
      clientId: clientId,
      scope: scopes
  }).then( () => {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    runQueryButton.onclick = handleRunQueryClick;
  }).catch((error) => {
    // Display the error on the page.
    const errorOutput = document.getElementById('error');
    const textNode = document.createTextNode(JSON.stringify(error, null, 2));
    errorOutput.appendChild(textNode);
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    runQueryButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    runQueryButton.style.display = 'none';
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function handleRunQueryClick(event) {
  makeApiCall();
}
// [END analyticsdata_pivot_demo_initialize]

// [START analyticsdata_pivot_demo_make_api_call]
// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
  // Make a call to the Google Analytics Data API v1. This call builds a pivot
  // report with 'country', 'language' and 'browser' pivots, displaying the
  // number of sessions for each dimension combination. Adjust the date range
  // as necessary.
  //
  // See https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runPivotReport
  //   for more information on pivot report request structure.
  // [START analyticsdata_pivot_demo_make_api_call_request]
  // Get configuration values provided by a user in the UI.
  const propertyId = document.getElementById('property-id').value;
  const pivotReportQuery = {
    'property': 'properties/' + propertyId,
    'dateRanges': [
      {
        'startDate': '14daysAgo',
        'endDate': 'yesterday'
      }
    ],
    'pivots': [
      {
        'fieldNames': [
          'country'
        ],
        'limit': 250,
        'orderBys': [
          {
            'dimension': {
              'dimensionName': 'country'
            }
          }
        ]
      },
      {
        'fieldNames': [
          'language'
        ],
        'limit': 3,

      },
      {
        'fieldNames': [
          'browser'
        ],
        'limit': 5,
      }
    ],
    'metrics': [
      {
        'name': 'sessions'
      }
    ],
    'dimensions': [
      {
        'name': 'country'
      },
      {
        'name': 'language'
      },
      {
        'name': 'browser'
      }
    ]
  };
  gapi.client.analyticsdata.properties.runPivotReport(pivotReportQuery).then(
      (response) => {
    // [END analyticsdata_pivot_demo_make_api_call_request]

    // [START analyticsdata_pivot_demo_make_api_call_draw_headers]

    // ----------------------------------------------------------------
    // Draw the horizontal pivot table headers.
    // ----------------------------------------------------------------
    // Get a reference the result table element.
    const resultTable = document.getElementById('result');

    // Clear the output.
    while (resultTable.firstChild) {
      resultTable.removeChild(resultTable.firstChild);
    }

    // Get a reference the header response object for each pivot.
    const countryPivotDimensionHeaders = response.result.pivotHeaders[0].pivotDimensionHeaders;
    const languagePivotDimensionHeaders = response.result.pivotHeaders[1].pivotDimensionHeaders;
    const browserPivotDimensionHeaders = response.result.pivotHeaders[2].pivotDimensionHeaders;

    // Insert a row for the 'browser' pivot header.
    const browserPivotRow = resultTable.insertRow(0);
    // Insert a row for the 'language' pivot header.
    const languagePivotRow = resultTable.insertRow(0);

    // Insert an empty cell for each horizontal header row.
    browserPivotRow.insertCell(0);
    languagePivotRow.insertCell(0);

    // Draw horizontal headers for 'language' and 'browser' pivots.
    for(const languagePivotDimensionHeader of languagePivotDimensionHeaders)
    {
      // Append a cell to the 'language' header row.
      const newCell = languagePivotRow.insertCell(-1);

      // Each 'language' pivot header cell spans multiple cells determined by
      // the 'browser' pivot size.
      newCell.colSpan = browserPivotDimensionHeaders.length;

      // Populate a 'language' pivot header cell.
      const value =  languagePivotDimensionHeader.dimensionValues[0].value;
      const textNode = document.createTextNode(value);
      newCell.appendChild(textNode);

      // For every cell of the 'language' pivot header, multiple 'browser' pivot
      // header cells must be created.
      for(const browserPivotDimensionHeader of browserPivotDimensionHeaders)
      {
        // Append a cell to the 'browser' header row.
        const newCell = browserPivotRow.insertCell(-1);

        // Populate a 'browser' pivot header cell.
        const value =  browserPivotDimensionHeader.dimensionValues[0].value;
        const textNode = document.createTextNode(value);
        newCell.appendChild(textNode);
      }
    }
    // [END analyticsdata_pivot_demo_make_api_call_draw_headers]

    // [START analyticsdata_pivot_demo_make_api_call_create_grid]

    // ----------------------------------------------------------------
    // Draw the vertical pivot table header and create the placeholder
    // cell grid.
    // ----------------------------------------------------------------

    // This is a mapping of a cell key to a cell element which will be used to
    // locate the table cell when populating the result table with metric values.
    //
    // Every row of an API response object contains data about a single pivot
    // table cell, so it is necessary to locate a cell corresponding to the
    // particular dimension combination when populating a table.
    const gridMapping = {};

    // Create a new row for every country in the response.
    for(const countryPivotDimensionHeader of countryPivotDimensionHeaders)
    {
      // Insert a row at the end of the table.
      const newRow = resultTable.insertRow(-1);

      // Insert a cell in the row at index 0.
      const newCell = newRow.insertCell(0);

      // Populate the first cell of the row with a 'country' pivot dimension
      // value.
      const value = countryPivotDimensionHeader.dimensionValues[0].value;
      const textNode = document.createTextNode(value);
      newCell.appendChild(textNode);

      // Create blank placeholder cells of the result table.
      for(const languagePivotDimensionHeader of languagePivotDimensionHeaders)
      {
        for(const browserPivotDimensionHeader of browserPivotDimensionHeaders)
        {
          const countryDimensionValue = countryPivotDimensionHeader.dimensionValues[0].value;
          const languageDimensionValue = languagePivotDimensionHeader.dimensionValues[0].value;
          const browserDimensionValue = browserPivotDimensionHeader.dimensionValues[0].value;

          // Create a unique key for the current cell.
          const cellKey = [countryDimensionValue,
            languageDimensionValue,
            browserDimensionValue];

          // Add a blank placeholder cell to the grid. This cell will be
          // populated with a metrics value later.
          const blankCell = newRow.insertCell()

          // Remember the reference to the cell by its key. This mapping will
          // be used to populate the table with metric values in the next step.
          gridMapping[cellKey] = blankCell;
        }
      }
    }
    // [END analyticsdata_pivot_demo_make_api_call_create_grid]

    // [START analyticsdata_pivot_demo_make_api_call_populate_metrics]
    // ----------------------------------------------------------------
    // Populate the result table with metric values.
    // ----------------------------------------------------------------

    // Populate the results table grid with metric values. Every row of an API
    // response object contains data about a single pivot table cell, so each
    // cell of the result table is populated individually.
    for(const row of response.result.rows)
    {
      const countryDimensionValue = row.dimensionValues[0].value;
      const languageDimensionValue = row.dimensionValues[1].value;
      const browserDimensionValue = row.dimensionValues[2].value;

      // The metric value to insert in a cell.
      const metricValue = row.metricValues[0].value;

      // Calculate the unique key for the cell.
      const cellKey = [countryDimensionValue,
        languageDimensionValue,
        browserDimensionValue];

      // Lookup the cell by its key and populate it with the metric value.
      const textNode = document.createTextNode(metricValue);
      gridMapping[cellKey].appendChild(textNode);
    }
    // [END analyticsdata_pivot_demo_make_api_call_populate_metrics]
  }).catch((error) => {
    // Display the error on the page.
    const errorOutput = document.getElementById('error');
    const textNode = document.createTextNode(JSON.stringify(error,null, 2));
    errorOutput.appendChild(textNode);
  });

  // Display the report query on the page for debug purposes.
  const debugOutput = document.getElementById('query');
  // Clear the output.
  while (debugOutput.firstChild) {
    debugOutput.removeChild(debugOutput.firstChild);
  }

  const textNode = document.createTextNode('Pivot report query:\n' +
      JSON.stringify(pivotReportQuery, null, 2));
  debugOutput.appendChild(textNode);
}

// [END analyticsdata_pivot_demo_make_api_call]
// [END analyticsdata_pivot_demo]
