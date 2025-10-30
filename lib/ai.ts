import OpenAI from 'openai'

const hasOpenAI = !!process.env.OPENAI_API_KEY
const hasAzure = !!process.env.AZURE_OPENAI_API_KEY

function client(){
  if(hasOpenAI){ 
    return new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 8000 // 8s timeout
    }) 
  }
  if(hasAzure){
    return new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY! },
      timeout: 8000 // 8s timeout
    } as any)
  }
  throw new Error('Missing OPENAI_API_KEY or AZURE_OPENAI_* env')
}

const MODEL = hasOpenAI ? 'gpt-3.5-turbo' : (process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo')

type Locale = 'fi'|'en'|'sv'

function sysHint(locale:Locale){
  switch(locale){
    case 'en': return 'You are a helpful math tutor for children learning multiplication tables. Give a short, encouraging hint to help solve the multiplication problem. Never give the direct answer. Focus on patterns, skip counting, or memory tricks. Maximum 8 words.'
    case 'sv': return 'Du är en hjälpsam mattlärare för barn som lär sig multiplikationstabeller. Ge ett kort, uppmuntrande tips för att hjälpa lösa multiplikationsproblemet. Ge aldrig det direkta svaret. Fokusera på mönster, räkning eller minnestekniker. Maximalt 8 ord.'
    default:   return 'Olet avulias matematiikanopettaja lapsille, jotka opettelevat kertotauluja. Anna lyhyt, kannustava vihje kertolaskun ratkaisemiseksi. Älä koskaan anna suoraa vastausta. Keskity kuvioihin, laskemiseen tai muistitekniikoihin. Maksimissaan 8 sanaa.'
  }
}
function userHint(a:number,b:number, locale:Locale){
  switch(locale){
    case 'en': return `Give a helpful hint for the multiplication problem ${a} × ${b}. Do not give the answer ${a*b}. Help the child think about it.`
    case 'sv': return `Ge ett hjälpsamt tips för multiplikationsproblemet ${a} × ${b}. Ge inte svaret ${a*b}. Hjälp barnet att tänka på det.`
    default:   return `Anna hyödyllinen vihje kertolaskuun ${a} × ${b}. Älä anna vastausta ${a*b}. Auta lasta ajattelemaan asiaa.`
  }
}

function sysFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'You are an encouraging elementary school math teacher. Give a cheerful, supportive comment about the student\'s multiplication practice performance. Be positive and motivating.'
    case 'sv': return 'Du är en uppmuntrande lågstadielärare i matematik. Ge en glad, stödjande kommentar om elevens prestationer i multiplikationsträning. Var positiv och motiverande.'
    default:   return 'Olet kannustava alakoulun matematiikanopettaja. Anna iloinen, tukeva kommentti oppilaan kertotauluharjoittelun suoriutumisesta. Ole positiivinen ja motivoiva.'
  }
}
function userFeedback(stats:any, locale:Locale){
  const {correct, total, avgMs} = stats
  switch(locale){
    case 'en': return `${correct}/${total} correct, ${Math.round(avgMs/1000)}s avg. One happy sentence:`
    case 'sv': return `${correct}/${total} rätt, ${Math.round(avgMs/1000)}s medel. En glad mening:`
    default:   return `${correct}/${total} oikein, ${Math.round(avgMs/1000)}s keskim. Yksi iloinen lause:`
  }
}

export async function aiHint(a:number,b:number, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'user',content:`${sysHint(locale)} ${userHint(a,b,locale)}`}],
    temperature:0.3, 
    max_tokens:20,
    presence_penalty:0,
    frequency_penalty:0
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

export async function aiRoundFeedback(stats:{correct:number,total:number,avgMs:number,mistakes:Array<{a:number,b:number}>}, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'user',content:`${sysFeedback(locale)} ${userFeedback(stats,locale)}`}],
    temperature:0.4, 
    max_tokens:50,
    presence_penalty:0
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

function sysFinalFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'Encouraging teacher. 2 sentences max.'
    case 'sv': return 'Uppmuntrande lärare. Max 2 meningar.'
    default:   return 'Kannustava opettaja. Max 2 lausetta.'
  }
}

function userFinalFeedback(stats:any, locale:Locale){
  const summary = `Total: ${stats.totalAnswered || 0}, Correct: ${stats.totalCorrect || 0}`
  switch(locale){
    case 'en': return `${summary}. Final encouragement:`
    case 'sv': return `${summary}. Slutuppmuntran:`
    default:   return `${summary}. Lopullinen kannustus:`
  }
}

export async function aiFinalFeedback(stats:any, locale:Locale='fi'){
  const c = client()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[{role:'user',content:`${sysFinalFeedback(locale)} ${userFinalFeedback(stats,locale)}`}],
    temperature:0.4, 
    max_tokens:80,
    presence_penalty:0
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

// Text-to-speech using OpenAI TTS API
export async function aiTextToSpeech(text: string, locale: Locale = 'fi'): Promise<ArrayBuffer> {
  const c = client()
  
  // Map locale to OpenAI voice
  let voice: string
  switch(locale) {
    case 'en': 
      voice = 'alloy' // Clear English voice
      break
    case 'sv': 
      voice = 'echo' // Good for Swedish
      break
    default: // 'fi'
      voice = 'nova' // Works well for Finnish
      break
  }

  try {
    const response = await (c as any).audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      speed: 0.9 // Slightly slower for children
    })

    return await response.arrayBuffer()
  } catch (error) {
    console.error('TTS API error:', error)
    throw error
  }
}
