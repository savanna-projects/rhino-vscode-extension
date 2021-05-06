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
        // TODO: get summary
        // TODO: get passed test cases - by quality (lower to higher)
        // TODO: get failed test cases - by quality (lower to higher)

        return this.getHtml()
            .replace('$(title)', this.testRun.title)
            .replace('$(summaryOutcome)', this.getSummaryOutcome())
            .replace('$(summaryTestCase)', this.getSummaryTestCase(this.testRun.testCases[0]));
    }

    private getHtml(): string {
        return `
        <html>
        <head>
            <style>
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
<div style="margin: 0.25rem;">
<pre>Start   : ${this.testRun.start}
End     : ${this.testRun.end}
Run Time: ${this.testRun.runTime.totalSeconds}</pre>
</div>
            $(summaryOutcome)
            $(summaryTestCase)
        </body>
        </html>`;
    }

    private getSummaryOutcome(): string {
        //  style="position: fixed; top: 1rem; left: 1rem;"
        var qulityColor = this.testRun.qualityRank < 80 ? '#E74C3C' : '#1ABB9C';
        return `
        <table>
        <tr>
            <td>
                <div class="card" id="x">
                    <div class="card-header" title="The amount of successful tests.">Total Pass</div>
                    <div class="card-body" style="color: #1ABB9C;">${this.testRun.totalPass}</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-header" title="The amount of failed tests.">Total Fail</div>
                    <div class="card-body" style="color: #E74C3C">${this.testRun.totalFail}</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-header" title="The amount of tests which Rhino did not verify or skipped due to, lack of assertions or tolerance configuration.">Total Inconclusive</div>
                    <div class="card-body" style="color: #f0ad4e;">${this.testRun.totalInconclusive}</div>
                </div>
            </td>
            <td>
                <div class="card">
                    <div class="card-header" title="The overall quality (the expected application behavior) of the test run.">Quality Rank</div>
                    <div class="card-body" style="color: ${qulityColor}">${this.testRun.qualityRank}%</div>
                </div>
            </td>
        </tr>
        </table>`;
    }

    private getSummaryTestCase(testCase: any): string {
        var qulityColor = this.testRun.qualityRank < 80 ? '#E74C3C' : '#1ABB9C';
        var steps = [];
        for (let i = 0; i < testCase.steps.length; i++) {
            steps.push(this.getTestStepsHtml(testCase.steps[i], i));
        }

        return `
            <div class="panel">
                <div style="padding: 0.25rem;">
                <span class="label">${testCase.key}</span>
<pre>Start       : ${testCase.start}
End         : ${testCase.end}
Quality Rank: <span style="color: ${qulityColor}">${testCase.qualityRank}</span>
Run Time    : <span style="color: #3498DB">${testCase.runTime.totalSeconds}</span>
On Attempt  : ${testCase.passedOnAttempt + 1}</pre>
                </div><br/>
                <div style="padding: 0.25rem;">
                    <table cellpadding="1" cellspacing="0" style="padding: 0; border: 0; line-height: normal">
                    ${steps.join('')}
                    </table>
                </div>
            </div>`;
    }

    private getTestStepsHtml(testStep: any, index: number): string {
        // setup
        var rowColor = index % 2 ? '#fff' : '#E7E9EB';
        var actionColor = testStep.actual === true ? '#1ABB9C' : '#E74C3C';
        var actionSign = testStep.actual === true ? 'P' : 'F';
        
        var html = `
        <tr style="background-color: ${rowColor};">
        <td style="width: 5%; text-align: center;"><pre>${index + 1}</pre></td>
        <td style="width: 3%; text-align: center;"><pre style="font-weight: 900; color: ${actionColor}">${actionSign}<pre></td>
        <td style="width: 41%;"><pre>${testStep.action}</pre></td>
        <td style="width: 41%;"><pre>${testStep.expected}</pre></td>
        <td style="width: 10%;"><pre style="color: #3498DB">${testStep.runTime.totalMilliseconds}<pre></td>
        </tr>
        `;

        return html;
    }
}