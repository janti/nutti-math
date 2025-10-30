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
    default:   return 'Olet viisas matematiikanopettaja. Anna ERI palautetta tarkan suorituksen perusteella: 9-10 oikein: "Loistavaa! Osaat todella kertotaulusi!" 7-8 oikein: "Hienoa työtä, olet todella kehittymässä tässä!" 5-6 oikein: "Hyvä yritys! Jatka harjoittelua niin kehityt vielä lisää." 3-4 oikein: "Tämä oli haastavaa tänään, mutta niin me opimme parhaiten!" 1-2 oikein: "Nämä olivat vaikeita tehtäviä - jokainen yritys tekee sinusta vahvemman matematiikassa!" 0 oikein: "Älä huoli, kertolaskujen oppiminen vie aikaa. Rakennat matemaattisia lihaksiasi!" Ole rehellinen vaikeudesta mutta pysy rohkaisevana.'
  }
}
function userFeedback(stats:any, locale:Locale){
  const {correct, total, avgMs, mistakes} = stats
  const errorCount = mistakes?.length || (total - correct)
  
  switch(locale){
    case 'en': return `IMPORTANT: Student got exactly ${correct} out of ${total} correct. Follow the rules: ${correct} correct answers means specific feedback for that exact number. Do not give generic praise. Be specific about this performance level.`
    case 'sv': return `VIKTIGT: Eleven fick exakt ${correct} av ${total} rätt. Följ reglerna: ${correct} rätta svar betyder specifik feedback för just det exakta antalet. Ge inte generisk beröm. Var specifik om denna prestationsnivå.`
    default:   return `TÄRKEÄÄ: Oppilas sai täsmälleen ${correct}/${total} oikein. Noudata sääntöjä: ${correct} oikeaa vastausta tarkoittaa erityistä palautetta juuri tälle tarkolle määrälle. Älä anna yleistä kehuja. Ole tarkka tästä suoritustasosta.`
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
    max_tokens:40,
    presence_penalty:0
  })
  
  const result = r.choices?.[0]?.message?.content?.trim() ?? ''
  console.log('AI Response:', result)
  return result
}

function sysFinalFeedback(locale:Locale){
  switch(locale){
    case 'en': return 'You are a wise math teacher giving final game feedback. Respond based on overall performance: 80%+ correct = proud celebration of mastery. 60-79% = encouraging about good progress. 40-59% = supportive about learning journey. Under 40% = gentle encouragement about effort and growth. Be specific about the achievement level, not generic praise. Max 2 sentences.'
    case 'sv': return 'Du är en vis mattelärare som ger slutlig spelåterkoppling. Svara baserat på övergripande prestation: 80%+ rätt = stolt firande av behärskning. 60-79% = uppmuntrande om goda framsteg. 40-59% = stödjande om inlärningsresan. Under 40% = mild uppmuntran om ansträngning och tillväxt. Var specifik om prestationsnivån, inte generisk beröm. Max 2 meningar.'
    default:   return 'Olet viisas matematiikanopettaja antamassa lopullista pelipalautetta. Vastaa kokonaissuorituksen perusteella: 80%+ oikein = ylpeä juhlinta osaamisesta. 60-79% = rohkaisevaa hyvästä edistymisestä. 40-59% = tukevaa oppimismatkasta. Alle 40% = lempeää rohkaisua yrittämisestä ja kasvusta. Ole tarkka saavutustasosta, älä anna yleisiä kehuja. Max 2 lausetta.'
  }
}

function userFinalFeedback(stats:any, locale:Locale){
  const total = stats.totalAnswered || 0
  const correct = stats.totalCorrect || 0
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  
  switch(locale){
    case 'en': return `IMPORTANT: Student completed the entire game with exactly ${correct} correct out of ${total} total answers (${percentage}% success rate). Give specific feedback for this exact performance level, not generic encouragement.`
    case 'sv': return `VIKTIGT: Eleven slutförde hela spelet med exakt ${correct} rätt av ${total} totala svar (${percentage}% framgång). Ge specifik feedback för just denna prestationsnivå, inte generisk uppmuntran.`
    default:   return `TÄRKEÄÄ: Oppilas suoritti koko pelin täsmälleen ${correct} oikealla vastauksella ${total}:sta (${percentage}% onnistuminen). Anna tarkkaa palautetta juuri tälle suoritustasolle, ei yleistä rohkaisua.`
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
    max_tokens:60,
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
