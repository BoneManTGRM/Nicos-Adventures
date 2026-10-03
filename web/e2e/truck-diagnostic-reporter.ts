import type {Reporter,TestCase,TestResult} from '@playwright/test/reporter';
// Preserve diagnostics in readable job logs even if a workflow later times out.
export default class TruckDiagnostics implements Reporter {
 onTestEnd(test:TestCase,result:TestResult){
  if(result.status==='passed'||result.status==='skipped')return;
  console.log('TRUCK_TEST_FAILURE '+JSON.stringify({title:test.titlePath(),status:result.status,retry:result.retry,duration:result.duration,errors:result.errors.map(e=>({message:e.message?.slice(0,6000),stack:e.stack?.slice(0,8000)}))}));
 }
}
