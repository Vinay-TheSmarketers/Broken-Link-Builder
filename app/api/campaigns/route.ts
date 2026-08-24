import { NextResponse } from 'next/server';
import { createCampaign, estimateAuthority, getDashboard, IngestTarget, normalizeTarget, saveValidation } from '@/lib/db';

export const runtime='edge';

async function inspectTarget(url:string,domain:string){
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),9000); let httpStatus:number|null=null; let text='';
  try{const response=await fetch(url,{redirect:'follow',signal:controller.signal,headers:{'user-agent':'vBB Link Validator/1.0 (+https://smarketers.com)'}});httpStatus=response.status;const type=response.headers.get('content-type')??'';if(type.includes('text/html'))text=(await response.text()).slice(0,180000).toLowerCase();}catch{httpStatus=null}finally{clearTimeout(timeout)}
  const hard=httpStatus===null||httpStatus===404||httpStatus===410||(httpStatus??0)>=500; const soft=!hard&&httpStatus===200&&['page not found','404 not found','doesn’t exist','does not exist','content is no longer available'].some(phrase=>text.includes(phrase)); const status=hard?'broken':soft?'soft_404':'verified';
  let archivedUrl:string|null=null; if(hard||soft){try{const response=await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);const payload=await response.json() as {archived_snapshots?:{closest?:{available?:boolean;url?:string}}};if(payload.archived_snapshots?.closest?.available)archivedUrl=payload.archived_snapshots.closest.url??null;}catch{archivedUrl=null}}
  const slug=new URL(url).pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g,' ')||domain; const title=slug.replace(/\b\w/g,char=>char.toUpperCase()); const draft=hard||soft?`# ${title}: A Current, Practical Guide\n\n## What changed\nThis replacement explains the topic with current examples, clear definitions, and verifiable recommendations.\n\n## The essential framework\n1. Define the reader's goal and starting point.\n2. Compare the available approaches using evidence.\n3. Turn the best approach into a repeatable checklist.\n\n## Implementation checklist\n- Confirm scope and success criteria.\n- Validate every source and outbound reference.\n- Add examples that reflect current practice.\n- Review the resource quarterly for accuracy.\n\n## Key takeaway\nA useful resource should help the reader act with confidence, not merely describe the topic.`:undefined;
  return {status,httpStatus,soft404:soft,archivedUrl,email:`editor@${domain}`,draft};
}

export async function GET(){try{return NextResponse.json(await getDashboard())}catch(error){return NextResponse.json({message:error instanceof Error?error.message:'Database unavailable'},{status:500})}}

export async function POST(request:Request){
  try{const body=await request.json() as {name?:string;targets?:IngestTarget[]};if(!Array.isArray(body.targets)||!body.targets.length)return NextResponse.json({message:'Add at least one target.'},{status:400});
    const unique=new Map<string,{url:string;domain:string;authority:number}>(); for(const item of body.targets.slice(0,50)){if(!item||typeof item.url!=='string')continue;const normalized=normalizeTarget(item.url);if(!normalized)continue;const authority=Number.isFinite(item.authority)?Math.round(Number(item.authority)):estimateAuthority(normalized.domain);if(authority>50)unique.set(normalized.url,{...normalized,authority});}
    const targets=[...unique.values()];if(!targets.length)return NextResponse.json({message:'No valid targets passed the DR 50+ filter.'},{status:422});const campaign=await createCampaign(body.name?.trim()||'Authority scan',targets);
    await Promise.all(campaign.targets.map(async target=>{const result=await inspectTarget(target.url,target.domain);await saveValidation(campaign.id,target.id,result)}));return NextResponse.json(await getDashboard(),{status:201});
  }catch(error){return NextResponse.json({message:error instanceof Error?error.message:'Campaign creation failed.'},{status:500})}
}
