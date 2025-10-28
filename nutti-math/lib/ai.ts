import OpenAI from 'openai'

const hasOpenAI = !!process.env.OPENAI_API_KEY
const hasAzure = !!process.env.AZURE_OPENAI_API_KEY

function client(){
  if(hasOpenAI){ return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) }
  if(hasAzure){
    return new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY! }
    } as any)
  }
  throw new Error('Missing OPENAI_API_KEY or AZURE_OPENAI_* env')
}

const MODEL = hasOpenAI ? 'gpt-3.5-turbo' : ''

type Locale = 'fi'|'en'|'sv'

function sysHint(locale:Locale){
  switch(locale){
    case 'en': return 'You write very short, kid-friendly hints in English. Do not reveal the answer.'
    case 'sv': return 'Du skriver mycket korta, barnvänliga tips på svenska. Avslöja inte svaret.'
    default:   return 'Kirjoitat hyvin lyhyitä, lapsiystävällisiä vihjeitä suomeksi. Älä paljasta vastausta.'
  }
}
function userHint(a:number,b:number, locale:Locale){
  switch(locale){
    case 'en': return `Give one short hint for ${a}×${b} (max 12 words). Prefer: 10×B−B, double/halve, grouping.`
    case 'sv': return `Ge ett kort tips för ${a}×${b} (max 12 ord). Föredra: 10×B−B, dubbla/halvera, gruppering.`
    default:   return `Anna lyhyt vihje kertolaskuun ${a}×${b} (max 12 sanaa). Hyväksytyt: 10×B−B, puolitus/tuplaus, ryhmittely.`
  }
}

function sysFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'You are an encouraging elementary math coach. Write briefly in English.'
    case 'sv': return 'Du är en uppmuntrande lågstadielärare i matematik. Skriv kort på svenska.'
    default:   return 'Olet kannustava alakoulun matikan valmentaja. Kirjoita lyhyesti suomeksi.'
  }
}
function userFeedback(stats:any, locale:Locale){
  const json = JSON.stringify(stats)
  switch(locale){
    case 'en': return `Data: ${json}. Write two cheerful sentences about progress.`
    case 'sv': return `Data: ${json}. Skriv två glada meningar om framsteg.`
    default:   return `Data: ${json}. Kirjoita 2 iloista lausetta edistymisestä.`
  }
}

export async function aiHint(a:number,b:number, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'system',content:sysHint(locale)},{role:'user',content:userHint(a,b,locale)}],
    temperature:0.4, max_tokens:40
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

export async function aiRoundFeedback(stats:{correct:number,total:number,avgMs:number,mistakes:Array<{a:number,b:number}>}, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'system',content:sysFeedback(locale)},{role:'user',content:userFeedback(stats,locale)}],
    temperature:0.5, max_tokens:160
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

function sysFinalFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'You are a cheerful math teacher giving final encouragement. Write 3-4 sentences in English about the overall performance.'
    case 'sv': return 'Du är en glad mattlärare som ger slutuppmuntran. Skriv 3-4 meningar på svenska om den totala prestationen.'
    default:   return 'Olet iloinen matikan opettaja, joka antaa lopullisen kannustuksen. Kirjoita 3-4 lausetta suomeksi kokonaissuorituksesta.'
  }
}

function userFinalFeedback(stats:any, locale:Locale){
  const json = JSON.stringify(stats)
  switch(locale){
    case 'en': return `Final game data: ${json}. Write encouraging summary about the whole game session.`
    case 'sv': return `Slutliga speldata: ${json}. Skriv uppmuntrande sammanfattning om hela spelsessionen.`
    default:   return `Lopulliset pelitiedot: ${json}. Kirjoita kannustava yhteenveto koko pelikerrasta.`
  }
}

export async function aiFinalFeedback(stats:any, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'system',content:sysFinalFeedback(locale)},{role:'user',content:userFinalFeedback(stats,locale)}],
    temperature:0.6, max_tokens:200
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}
