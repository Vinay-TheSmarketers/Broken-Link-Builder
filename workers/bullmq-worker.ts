import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

export type ValidationJob = { campaignId:string; targetId:string; url:string };
export type ValidationResult = { campaignId:string; targetId:string; url:string; httpStatus:number|null; soft404:boolean; status:'verified'|'broken'|'soft_404' };

const redisUrl=process.env.REDIS_URL;
if(!redisUrl)throw new Error('REDIS_URL is required to run the optional BullMQ worker.');
const connection=new IORedis(redisUrl,{maxRetriesPerRequest:null,enableReadyCheck:true});
export const validationQueue=new Queue<ValidationJob,ValidationResult>('vbb-link-validation',{connection});

async function validate(job:Job<ValidationJob>):Promise<ValidationResult>{
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000); let httpStatus:number|null=null; let html='';
  try{const response=await fetch(job.data.url,{redirect:'follow',signal:controller.signal,headers:{'user-agent':'vBB BullMQ Validator/1.0 (+https://smarketers.com)'}});httpStatus=response.status;if((response.headers.get('content-type')??'').includes('text/html'))html=(await response.text()).slice(0,180000).toLowerCase();}catch{httpStatus=null}finally{clearTimeout(timeout)}
  const broken=httpStatus===null||httpStatus===404||httpStatus===410||(httpStatus??0)>=500;const soft404=!broken&&httpStatus===200&&['page not found','404 not found','does not exist','content is no longer available'].some(text=>html.includes(text));
  await job.updateProgress(100);return {...job.data,httpStatus,soft404,status:broken?'broken':soft404?'soft_404':'verified'};
}

const worker=new Worker<ValidationJob,ValidationResult>('vbb-link-validation',validate,{connection,concurrency:8,limiter:{max:30,duration:1000}});
worker.on('completed',job=>console.info(`[vBB] validated ${job.data.url}: ${job.returnvalue.status}`));
worker.on('failed',(job,error)=>console.error(`[vBB] validation failed for ${job?.data.url??'unknown target'}: ${error.message}`));

async function shutdown(){await worker.close();await validationQueue.close();await connection.quit();}
process.on('SIGINT',()=>void shutdown().then(()=>process.exit(0)));
process.on('SIGTERM',()=>void shutdown().then(()=>process.exit(0)));
