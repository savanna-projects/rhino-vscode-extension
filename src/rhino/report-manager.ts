export class ReportManager {
    // members: state
    private testRun: any;

    /**
     * Summary. Creates a new ReportManager instance.
     * 
     * @param testRun The RhinoTestRun by which to create the report.
     */
    constructor(testRun: any) {
        this.testRun = testRun;
    }

    /**
     * Summary. Get a simple and basic HTML report with CSS
     * 
     * @returns HTML string with the report data. 
     */
    public getHtmlReport(): string {
        // [v] TODO: get summary
        // [v] TODO: get test case
        // [v] TODO: get test steps
        // [v] TODO: get HTML layout
        // [ ] TODO: get passed test cases - by quality (lower to higher)
        // [ ] TODO: get failed test cases - by quality (lower to higher)

        // build
        var testCases = [];
        for (let i = 0; i < this.testRun.testCases.length; i++) {
            testCases.push(this.getSummaryTestCase(this.testRun.testCases[i]));
        }

        var html = this.getHtml()
            .replace('$(title)', this.testRun.title)
            .replace('$(summaryOutcome)', this.getSummaryOutcome())
            .replace('$(summaryTestCase)', testCases.join(''));

        return html;
    }

    // get the HTML report layout
    private getHtml(): string {
        // setup
        var metaData =
            '<div style="margin: 0.25rem;">' +
            '   <pre>Start   : ' + this.testRun.start +
            '   <br/>End     : ' + this.testRun.end +
            '   <br/>Run Time: ' + (Math.round(this.testRun.runTime.totalSeconds * 100) / 100).toFixed(2) + '</pre>' +
            '</div>';

        // get
        return `<html>
        <head>
            <style>
                pre {
                    overflow-x: auto;
                    white-space: pre-wrap;
                    white-space: -moz-pre-wrap;
                    white-space: -pre-wrap;
                    white-space: -o-pre-wrap;
                    word-wrap: break-word;
                }
                .steps-table {
                    padding: 0;
                    border: 0;
                    line-height: normal
                }
                .label {
                    box-sizing: border-box;
                    display: inline;
                    padding: .2em .6em .3em;
                    font-size: 75%;
                    font-weight: 700;
                    line-height: 1;
                    color: #fff;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    background-color: #1ABB9C;
                }
                .panel {
                    font-size: 0.75rem;
                    font-weight: 400;
                    line-height: 1.125;
                    box-sizing: border-box;
                    color: #111;
                    background-color: #f6f7f8;
                    box-shadow: 0 1px 1px rgba(0,0,0,.05);
                    margin: 0.25rem;
                }
                .card {
                    background-clip: border-box;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    margin-bottom: 1rem !important;
                    max-width: 20rem;
                    border: solid 1px #2a2a2a
                }
                .card-header {
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: #fff;
                    word-wrap: break-word;
                    box-sizing: border-box;
                    padding: 0.5rem 1rem;
                    margin-bottom: 0;
                    background-color: #2a2a2a;
                    text-align: center;
                }
                .card-body {
                    font-size: 3rem;
                    font-weight: 600;
                    text-align: center;
                    line-height: 1.5;
                    color: #111;
                    word-wrap: break-word;
                    box-sizing: border-box;
                    flex: 1 1 auto;
                    padding: 1rem 1rem;
                    background-color: #fff;
                }
                table {
                    table-layout: fixed ;
                    width: 100% ;
                  }
                  td {
                    width: 25% ;
                  }
            </style>
        </head>
        <body>
            <h2>$(title)</h2>
            ${metaData}
            $(summaryOutcome)
            $(summaryTestCase)
        </body>
        </html>`;
    }

    // get tests summary HTML
    private getSummaryOutcome(): string {
        // build components
        var qulityColor = this.testRun.qualityRank < 80 ? '#e74c3c' : '#1abb9c';
        var totalPass = `
        <td>
        <div class="card">
            <div class="card-header" title="The amount of successful tests.">Total Pass</div>
            <div class="card-body" style="color: #1abb9c;">${this.testRun.totalPass}</div>
        </div>
        </td>`;

        var totalFail = `
        <td>
        <div class="card">
            <div class="card-header" title="The amount of failed tests.">Total Fail</div>
            <div class="card-body" style="color: #e74c3c;">${this.testRun.totalFail}</div>
        </div>
        </td>`;

        var totalInconclusive = `
        <td>
        <div class="card">
            <div class="card-header" title="The amount of tests which Rhino did not verify or skipped due to, lack of assertions or tolerance configuration.">Total Inconclusive</div>
            <div class="card-body" style="color: #f0ad4e;">${this.testRun.totalInconclusive}</div>
        </div>
        </td>`;

        var qualityRank = `
        <td>
        <div class="card">
            <div class="card-header" title="The overall quality (the expected application behavior) of the test run.">Quality Rank</div>
            <div class="card-body" style="color: ${qulityColor}">${Math.round(this.testRun.qualityRank)}%</div>
        </div>
        </td>`;

        // get
        return `
        <table>
        <tr>
            ${totalPass}
            ${totalFail}
            ${totalInconclusive}
            ${qualityRank}
        </tr>
        </table>`;
    }

    // get a single test case HTML
    private getSummaryTestCase(testCase: any): string {
        // setup
        var qulityColor = this.testRun.qualityRank < 80 ? '#e74c3c' : '#1abb9c';
        var metaData =
            '<pre>Start       : ' + testCase.start +
            '<br/>End         : ' + testCase.end +
            '<br/>Quality Rank: <span style="color: ' + qulityColor + '">' + testCase.qualityRank + '</span>' +
            '<br/>Run Time    : <span style="color: #3498db">' + (Math.round(testCase.runTime.totalSeconds * 100) / 100).toFixed(2) + '</span>' +
            '<br/>On Attempt  : ' + testCase.passedOnAttempt + '</pre>';

        // build
        var steps = [];
        for (let i = 0; i < testCase.steps.length; i++) {
            steps.push(this.getTestStepsHtml(testCase.steps[i], i));
        }

        // get
        return `
        <div class="panel">
        <div style="padding: 0.25rem;">
            <span class="label">${testCase.key}-${testCase.iteration}</span>
            ${metaData}<br/>
            <div style="padding: 0.25rem;">
                <table cellpadding="1" cellspacing="0" class="steps-table">${steps.join('')}</table>
            </div>
        </div>`;
    }

    private getTestStepsHtml(testStep: any, index: number): string {
        // setup
        var rowColor = index % 2 ? '#fff' : '#e7e9eB';
        var actionColor = testStep.actual === true ? '#1abb9c' : '#e74c3c';
        var actionSign = testStep.actual === true ? 'P' : 'F';

        var html = `
        <tr style="background-color: ${rowColor};">
            <td style="width: 5%; vertical-align: top;"><pre>${index + 1}</pre></td>
            <td style="width: 3%; vertical-align: top;"><pre style="font-weight: 900; color: ${actionColor}">${actionSign}<pre></td>
            <td style="width: 41%; vertical-align: top;"><pre>${testStep.action}</pre></td>
            <td style="width: 41%; vertical-align: top;"><pre>${testStep.expected}</pre></td>
            <td style="width: 10%; vertical-align: top;"><pre style="color: #3498db">${(Math.round(testStep.runTime.totalMilliseconds * 100) / 100).toFixed(2)}<pre></td>
        </tr>`;

        // get
        return html;
    }
}
