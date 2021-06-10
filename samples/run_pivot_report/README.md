# Google Analytics Data API v1 Pivot Report demo

This application demonstrates how to build a pivot report
using the runPivotReport method of the Google Analytics Data
API v1 and visualize the result using JavaScript.

The API call builds a pivot report with "country",
"language" and "browser" pivots, displaying the number
of sessions for each dimension combination for the
specified date range. Adjust the date range of a query
as necessary by editing `run_pivot_report.js`.


python3 -m http.server 8080

