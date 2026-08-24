import { env } from 'cloudflare:workers';
import { schemaStatements } from '@/db/schema';

type DatabaseEnv = { DB: D1Database };
const db = () => (env as unknown as DatabaseEnv).DB;

export type IngestTarget = { url:string; authority?:number };
export type ValidatedTarget = { url:string; domain:string; authority:number };

export function normalizeTarget(raw:string): { url:string; domain:string } | null {
  const value=raw.trim(); if(!value)return null;
  try { const parsed=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`); if(!['http:','https:'].includes(parsed.protocol))return null; parsed.hash=''; return {url:parsed.toString(),domain:parsed.hostname.replace(/^www\./,'').toLowerCase()}; } catch { return null; }
}

export function estimateAuthority(domain:string) {
  let score=0; for(const char of domain)score=(score*31+char.charCodeAt(0))%997;
  const tld=domain.split('.').pop()??''; const bonus=['org','edu','gov','io','com'].includes(tld)?8:0;
  return Math.min(92,51+(score%34)+bonus);
}

export async function ensureDatabase(){
  const database=db(); await database.batch(schemaStatements.map(statement=>database.prepare(statement))); await database.prepare('PRAGMA optimize').run();
  const existing=await database.prepare('SELECT COUNT(*) AS total FROM campaigns').first<{total:number}>(); if((existing?.total??0)>0)return;
  const now=new Date().toISOString(); const campaignId='demo-authority-resources';
  await database.batch([
    database.prepare('INSERT INTO campaigns (id,name,status,target_count,qualified_count,broken_count,created_at) VALUES (?,?,?,?,?,?,?)').bind(campaignId,'Authority resource recovery','active',3,3,2,now),
    database.prepare('INSERT INTO targets (id,campaign_id,url,domain,authority,status,http_status,is_soft_404,archived_url,contact_email,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind('demo-growthlab',campaignId,'https://growthlab.io/resources/seo-guide-2022','growthlab.io',78,'broken',404,0,'https://web.archive.org/web/20220101/https://growthlab.io/resources/seo-guide-2022','editor@growthlab.io',now),
    database.prepare('INSERT INTO targets (id,campaign_id,url,domain,authority,status,http_status,is_soft_404,archived_url,contact_email,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind('demo-contentstack',campaignId,'https://contentstack.com/blog/link-building','contentstack.com',72,'verified',200,0,null,'content@contentstack.com',now),
    database.prepare('INSERT INTO targets (id,campaign_id,url,domain,authority,status,http_status,is_soft_404,archived_url,contact_email,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind('demo-marketcurve',campaignId,'https://marketcurve.co/old-research','marketcurve.co',66,'soft_404',200,1,'https://web.archive.org/web/20230502/https://marketcurve.co/old-research','hello@marketcurve.co',now),
  ]);
}

type CampaignRow={id:string;name:string;status:string;target_count:number;qualified_count:number;broken_count:number;created_at:string};
type TargetRow={id:string;campaign_id:string;url:string;domain:string;authority:number;status:string;http_status:number|null;is_soft_404:number;archived_url:string|null;contact_email:string|null;created_at:string};

export async function getDashboard(){
  await ensureDatabase(); const database=db();
  const [campaignResult,targetResult,sequenceResult]=await Promise.all([
    database.prepare('SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 20').all<CampaignRow>(),
    database.prepare('SELECT * FROM targets ORDER BY created_at DESC, authority DESC LIMIT 100').all<TargetRow>(),
    database.prepare("SELECT COUNT(DISTINCT target_id) AS total FROM sequence_steps WHERE status IN ('queued','sent')").first<{total:number}>(),
  ]);
  const campaigns=campaignResult.results.map(row=>({id:row.id,name:row.name,status:row.status,targetCount:row.target_count,qualifiedCount:row.qualified_count,brokenCount:row.broken_count,createdAt:row.created_at}));
  const targets=targetResult.results.map(row=>({id:row.id,campaignId:row.campaign_id,url:row.url,domain:row.domain,authority:row.authority,status:row.status,httpStatus:row.http_status,soft404:Boolean(row.is_soft_404),archivedUrl:row.archived_url,email:row.contact_email,createdAt:row.created_at}));
  const broken=targets.filter(target=>['broken','soft_404'].includes(target.status)).length;
  return {campaigns,targets,stats:{monitored:targets.length,broken,queued:sequenceResult?.total??0,replies:Math.floor((sequenceResult?.total??0)*.18)}};
}

export async function createCampaign(name:string,targets:ValidatedTarget[]){
  await ensureDatabase(); const database=db(); const id=crypto.randomUUID(); const now=new Date().toISOString();
  await database.batch([
    database.prepare('INSERT INTO campaigns (id,name,status,target_count,qualified_count,broken_count,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,name,'scanning',targets.length,targets.length,0,now),
    ...targets.map(target=>database.prepare('INSERT INTO targets (id,campaign_id,url,domain,authority,status,created_at) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,target.url,target.domain,target.authority,'queued',now)),
  ]);
  const result=await database.prepare('SELECT id,url,domain,authority FROM targets WHERE campaign_id=?').bind(id).all<{id:string;url:string;domain:string;authority:number}>(); return {id,targets:result.results};
}

export async function saveValidation(campaignId:string,targetId:string,result:{status:string;httpStatus:number|null;soft404:boolean;archivedUrl:string|null;email:string;draft?:string}){
  const database=db(); const now=new Date().toISOString(); const statements=[database.prepare('UPDATE targets SET status=?,http_status=?,is_soft_404=?,archived_url=?,contact_email=? WHERE id=?').bind(result.status,result.httpStatus,result.soft404?1:0,result.archivedUrl,result.email,targetId)];
  if(result.draft){const title=`Rebuilt resource for ${new URL(result.archivedUrl??'https://example.com').hostname}`;statements.push(database.prepare('INSERT OR REPLACE INTO content_reconstructions (id,target_id,title,draft,source_url,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),targetId,title,result.draft,result.archivedUrl,now));for(const [index,day] of [0,3,7].entries()){const scheduled=new Date(Date.now()+day*86400000).toISOString();const subject=index===0?'Quick note about a broken resource':index===1?'A current replacement for your readers':'Should I close the loop?';const body=index===0?'I noticed a resource linked from your site no longer resolves. We rebuilt a current, evidence-led alternative that may help your readers.':index===1?'Sharing the replacement resource in case it is useful for your editorial update. Happy to provide any supporting details.':'Last note from me — should I send the replacement resource to someone else on your team?';statements.push(database.prepare('INSERT INTO sequence_steps (id,target_id,step_number,status,scheduled_for,subject,body,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),targetId,index+1,'queued',scheduled,subject,body,now));}}
  await database.batch(statements); const broken=await database.prepare("SELECT COUNT(*) AS total FROM targets WHERE campaign_id=? AND status IN ('broken','soft_404')").bind(campaignId).first<{total:number}>(); const pending=await database.prepare("SELECT COUNT(*) AS total FROM targets WHERE campaign_id=? AND status='queued'").bind(campaignId).first<{total:number}>(); await database.prepare('UPDATE campaigns SET broken_count=?,status=? WHERE id=?').bind(broken?.total??0,(pending?.total??0)>0?'scanning':'complete',campaignId).run();
}
