import OpenAI from 'openai'

// Configuration constants
const REQUEST_TIMEOUT_MS = 8000
const hasOpenAI = !!process.env.OPENAI_API_KEY
const hasAzure = !!process.env.AZURE_OPENAI_API_KEY

/**
 * Creates OpenAI client instance based on available API configuration
 * Supports both OpenAI API and Azure OpenAI Service
 */
function createOpenAIClient(): OpenAI {
  if (hasOpenAI) { 
    return new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: REQUEST_TIMEOUT_MS
    }) 
  }
  
  if (hasAzure) {
    return new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY! },
      timeout: REQUEST_TIMEOUT_MS
    } as any)
  }
  
  throw new Error('Missing OPENAI_API_KEY or AZURE_OPENAI_* environment variables')
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
    case 'en': return 'Give encouraging feedback: 9-10 correct = "Excellent work!" 7-8 correct = "Great job!" 5-6 correct = "Good progress!" 3-4 correct = "Nice try!" 1-2 correct = "Keep practicing!" 0 correct = "Try again!" Always complete sentences. Max 10 words.'
    case 'sv': return 'Ge uppmuntrande feedback: 9-10 rätt = "Utmärkt arbete!" 7-8 rätt = "Bra jobbat!" 5-6 rätt = "Bra framsteg!" 3-4 rätt = "Bra försök!" 1-2 rätt = "Fortsätt träna!" 0 rätt = "Försök igen!" Alltid kompletta meningar. Max 10 ord.'
    default:   return 'Anna rohkaisevaa palautetta: 9-10 oikein = "Erinomaista!" 7-8 oikein = "Hyvää työtä!" 5-6 oikein = "Hyvää edistystä!" 3-4 oikein = "Hyvä yritys!" 1-2 oikein = "Jatka harjoittelua!" 0 oikein = "Yritä uudelleen!" Aina täydelliset lauseet. Max 10 sanaa.'
  }
}
function userFeedback(stats:any, locale:Locale){
  const {correct, total, avgMs, mistakes} = stats
  const errorCount = mistakes?.length || (total - correct)
  
  switch(locale){
    case 'en': return `Give encouraging feedback for ${correct}/${total} correct. Use complete sentences. Maximum 10 words.`
    case 'sv': return `Ge uppmuntrande feedback för ${correct}/${total} rätt. Använd kompletta meningar. Maximalt 10 ord.`
    default:   return `Anna rohkaisevaa palautetta ${correct}/${total} oikein. Käytä täydellisiä lauseita. Maksimissaan 10 sanaa.`
  }
}

export async function aiHint(a:number,b:number, locale:Locale='fi'){
  const c = createOpenAIClient()
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
  const c = createOpenAIClient()
  
  const systemMsg = sysFeedback(locale)
  const userMsg = userFeedback(stats,locale)
  
  console.log('AI Feedback Debug:')
  console.log('Stats:', stats)
  console.log('System:', systemMsg)
  console.log('User:', userMsg)
  
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[
      {role:'system', content: systemMsg},
      {role:'user', content: userMsg}
    ],
    temperature:0.2, 
    max_tokens:15,
    presence_penalty:0
  })
  
  const result = r.choices?.[0]?.message?.content?.trim() ?? ''
  console.log('AI Response:', result)
  return result
}

function sysFinalFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'Give encouraging final feedback: 80%+ = "Amazing! You mastered multiplication!" 60-79% = "Great progress! Keep practicing!" 40-59% = "Good effort! You\'re learning well!" Under 40% = "Nice try! Every practice helps!" Always complete sentences. Max 12 words.'
    case 'sv': return 'Ge uppmuntrande slutfeedback: 80%+ = "Fantastiskt! Du behärskar multiplikation!" 60-79% = "Bra framsteg! Fortsätt träna!" 40-59% = "Bra försök! Du lär dig bra!" Under 40% = "Bra försök! Varje träning hjälper!" Alltid kompletta meningar. Max 12 ord.'
    default:   return 'Anna rohkaisevaa loppupalautetta: 80%+ = "Mahtavaa! Osaat kertolaskut!" 60-79% = "Hyvää edistystä! Jatka harjoittelua!" 40-59% = "Hyvä yritys! Opit hyvin!" Alle 40% = "Hyvä yritys! Jokainen harjoitus auttaa!" Aina täydelliset lauseet. Max 12 sanaa.'
  }
}

function userFinalFeedback(stats:any, locale:Locale){
  const total = stats.totalAnswered || 0
  const correct = stats.totalCorrect || 0
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  
  switch(locale){
    case 'en': return `Give encouraging final feedback for ${percentage}% correct (${correct}/${total}). Use complete sentences. Maximum 12 words.`
    case 'sv': return `Ge uppmuntrande slutfeedback för ${percentage}% rätt (${correct}/${total}). Använd kompletta meningar. Maximalt 12 ord.`
    default:   return `Anna rohkaisevaa loppupalautetta ${percentage}% oikein (${correct}/${total}). Käytä täydellisiä lauseita. Maksimissaan 12 sanaa.`
  }
}

export async function aiFinalFeedback(stats:any, locale:Locale='fi'){
  const c = createOpenAIClient()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages:[
      {role:'system', content: sysFinalFeedback(locale)},
      {role:'user', content: userFinalFeedback(stats,locale)}
    ],
    temperature:0.2, 
    max_tokens:20,
    presence_penalty:0
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

/**
 * Generate speech audio from text using OpenAI TTS API
 * @param text - Text to convert to speech
 * @param locale - Language locale for voice selection
 * @returns Audio data as ArrayBuffer
 */
export async function aiTextToSpeech(text: string, locale: Locale = 'fi'): Promise<ArrayBuffer> {
  const c = createOpenAIClient()
  
  // Map locale to appropriate OpenAI voice for optimal pronunciation
  const voiceMap: Record<Locale, string> = {
    'en': 'alloy', // Clear English voice
    'sv': 'echo',  // Good for Swedish pronunciation
    'fi': 'nova'   // Works well for Finnish
  }
  
  const voice = voiceMap[locale] || voiceMap.fi

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
