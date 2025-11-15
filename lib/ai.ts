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
    case 'en': return 'You are a wise math teacher. Give DIFFERENT feedback based on exact performance: 9-10 correct: "Fantastic! You really know your multiplication tables!" 7-8 correct: "Great work, you\'re getting really good at this!" 5-6 correct: "Good effort! Keep practicing and you\'ll improve even more." 3-4 correct: "This was challenging today, but that\'s how we learn best!" 1-2 correct: "These were tough problems - every try helps you get stronger at math!" 0 correct: "Don\'t worry, multiplication takes time to learn. You\'re building your math muscles!" Be honest about the difficulty while staying encouraging.'
    case 'sv': return 'Du är en vis mattelärare. Ge OLIKA feedback baserat på exakt prestation: 9-10 rätt: "Fantastiskt! Du kan verkligen dina multiplikationstabeller!" 7-8 rätt: "Bra jobbat, du blir riktigt duktig på det här!" 5-6 rätt: "Bra försök! Fortsätt träna så blir du ännu bättre." 3-4 rätt: "Det här var utmanande idag, men så lär vi oss bäst!" 1-2 rätt: "Det här var tuffa problem - varje försök hjälper dig bli starkare i matte!" 0 rätt: "Oroa dig inte, multiplikation tar tid att lära sig. Du bygger dina mattmuskler!" Var ärlig om svårigheten medan du förblir uppmuntrande.'
    default:   return 'Sinun TÄYTYY antaa palaute oikeiden vastausten määrän mukaan: 10 oikein = "Täydellistä! Osaat kertotaulut!" 9 oikein = "Loistavaa! Melkein täydellinen!" 8 oikein = "Mahtavaa! Olet taitava!" 7 oikein = "Hienoa työtä!" 6 oikein = "Hyvää menoa!" 5 oikein = "Puolet oikein, jatka!" 4 oikein = "Haastavaa, mutta yrität!" 3 oikein = "Vaikea kierros!" 2 oikein = "Pari onnistui!" 1 oikein = "Yksi oikein!" 0 oikein = "Ei hätää, harjoitus auttaa!" ÄLÄ sekoita näitä!'
  }
}
function userFeedback(stats:any, locale:Locale){
  const {correct, total, avgMs, mistakes} = stats
  const errorCount = mistakes?.length || (total - correct)
  
  switch(locale){
    case 'en': return `CRITICAL: Student got EXACTLY ${correct} out of ${total} correct. You MUST give feedback for ${correct} correct answers, not any other number. Follow the exact rules for ${correct} correct answers only.`
    case 'sv': return `KRITISKT: Eleven fick EXAKT ${correct} av ${total} rätt. Du MÅSTE ge feedback för ${correct} rätta svar, inte något annat antal. Följ de exakta reglerna för ${correct} rätta svar endast.`
    default:   return `KRIITTISTÄ: Oppilas sai TÄSMÄLLEEN ${correct} oikeaa vastausta ${total}:sta. Sinun TÄYTYY antaa palaute ${correct} oikealle vastaukselle, ei mille tahansa muulle määrälle. Noudata tarkkoja sääntöjä ${correct} oikealle vastaukselle.`
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
    temperature:0.3, 
    max_tokens:40, // Increased to ensure complete sentences without cutoff
    presence_penalty:0
  })
  
  const result = r.choices?.[0]?.message?.content?.trim() ?? ''
  console.log('AI Response:', result)
  return result
}

function sysFinalFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'You are a wise math teacher giving final game feedback. Respond based on exact percentage: 80%+ = "Fantastic! You really mastered your multiplication tables!" 60-79% = "Great progress! You\'re learning well." 40-59% = "Good work! Keep practicing and you\'ll definitely improve." Under 40% = "Math is challenging, but every try makes you stronger!" Give ONLY one clear sentence that matches the exact performance level.'
    case 'sv': return 'Du är en vis mattelärare som ger slutlig spelåterkoppling. Svara baserat på exakt procent: 80%+ = "Fantastiskt! Du behärskar verkligen dina multiplikationstabeller!" 60-79% = "Stora framsteg! Du lär dig bra." 40-59% = "Bra jobbat! Fortsätt träna så förbättras du säkert." Under 40% = "Matte är utmanande, men varje försök gör dig starkare!" Ge BARA en tydlig mening som matchar exakt prestationsnivå.'
    default:   return 'Anna lyhyt palaute prosentin mukaan: 95-100% = "Täydellistä! Hallitset kertotaulut!" 85-94% = "Loistavaa! Olet taitava!" 75-84% = "Hienoa! Kehityt hyvin!" 65-74% = "Hyvää työtä!" 50-64% = "Puolet onnistui!" Alle 50% = "Harjoitus auttaa!" Anna VAIN yksi lause.'
  }
}

function userFinalFeedback(stats:any, locale:Locale){
  const total = stats.totalQuestions || stats.totalAnswered || 0
  const correct = stats.totalCorrect || 0
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  
  console.log('Final feedback debug:', { total, correct, percentage, stats })
  
  switch(locale){
    case 'en': return `CRITICAL: Student got ${percentage}% correct (${correct}/${total}). You MUST give feedback for ${percentage}% performance only. If 80%+ give celebration. If 60-79% give encouragement. If 40-59% give support. If under 40% give gentle encouragement.`
    case 'sv': return `KRITISKT: Eleven fick ${percentage}% rätt (${correct}/${total}). Du MÅSTE ge feedback för ${percentage}% prestation endast. Om 80%+ ge firande. Om 60-79% ge uppmuntran. Om 40-59% ge stöd. Om under 40% ge mild uppmuntran.`
    default:   return `Oppilas sai ${percentage}% oikein (${correct}/${total}). Anna palaute tälle prosentille.`
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
    temperature:0.3, 
    max_tokens:50, // Increased to prevent cutoff
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
