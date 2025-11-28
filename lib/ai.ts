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

type Locale = 'fi' | 'en' | 'sv'

function sysHint(locale: Locale, gameType: 'multiplication' | 'addition' = 'multiplication') {
  if (gameType === 'addition') {
    switch (locale) {
      case 'en': return 'You are a helpful math tutor for children learning addition. Give a clear, encouraging hint to help solve the addition problem. Never give the direct answer. Focus on counting strategies, number bonds, or mental math tricks. Maximum 15 words. Use simple language.'
      case 'sv': return 'Du är en hjälpsam mattlärare för barn som lär sig addition. Ge ett tydligt, uppmuntrande tips för att hjälpa lösa additionsproblemet. Ge aldrig det direkta svaret. Fokusera på räknestrategier eller mentala mattricks. Maximalt 15 ord. Använd enkelt språk.'
      default: return 'Olet avulias matematiikanopettaja lapsille, jotka opettelevat yhteenlaskua. Anna selkeä, kannustava vihje yhteenlaskun ratkaisemiseksi. Älä koskaan anna suoraa vastausta. Keskity laskustrategioihin, lukuparehin tai päässälaskutekniikoihin. Maksimissaan 15 sanaa. Käytä selkeää kieltä.'
    }
  } else {
    switch (locale) {
      case 'en': return 'You are a helpful math tutor for children learning multiplication tables. Give a clear, encouraging hint to help solve the multiplication problem. Never give the direct answer. Focus on patterns, skip counting, or memory tricks. Maximum 15 words. Use simple language.'
      case 'sv': return 'Du är en hjälpsam mattlärare för barn som lär sig multiplikationstabeller. Ge ett tydligt, uppmuntrande tips för att hjälpa lösa multiplikationsproblemet. Ge aldrig det direkta svaret. Fokusera på mönster, räkning eller minnestekniker. Maximalt 15 ord. Använd enkelt språk.'
      default: return 'Olet avulias matematiikanopettaja lapsille, jotka opettelevat kertotauluja. Anna selkeä, kannustava vihje kertolaskun ratkaisemiseksi. Älä koskaan anna suoraa vastausta. Keskity kuvioihin, laskemiseen tai muistitekniikoihin. Maksimissaan 15 sanaa. Käytä selkeää kieltä.'
    }
  }
}
function userHint(a: number, b: number, locale: Locale, gameType: 'multiplication' | 'addition' = 'multiplication') {
  if (gameType === 'addition') {
    switch (locale) {
      case 'en': return `Give a helpful hint for the addition problem ${a} + ${b}. Do not give the answer ${a + b}. Help the child think about it.`
      case 'sv': return `Ge ett hjälpsamt tips för additionsproblemet ${a} + ${b}. Ge inte svaret ${a + b}. Hjälp barnet att tänka på det.`
      default: return `Anna hyödyllinen vihje yhteenlaskuun ${a} + ${b}. Älä anna vastausta ${a + b}. Auta lasta ajattelemaan asiaa.`
    }
  } else {
    switch (locale) {
      case 'en': return `Give a helpful hint for the multiplication problem ${a} × ${b}. Do not give the answer ${a * b}. Help the child think about it.`
      case 'sv': return `Ge ett hjälpsamt tips för multiplikationsproblemet ${a} × ${b}. Ge inte svaret ${a * b}. Hjälp barnet att tänka på det.`
      default: return `Anna hyödyllinen vihje kertolaskuun ${a} × ${b}. Älä anna vastausta ${a * b}. Auta lasta ajattelemaan asiaa.`
    }
  }
}

function sysFeedback(locale: Locale) {
  switch (locale) {
    case 'en': return 'You are a wise math teacher. Give varied and constructive feedback based on performance. 9-10 correct: Celebrate their mastery! 7-8 correct: Praise their strong skills. 5-6 correct: Encourage them to keep practicing. 3-4 correct: Remind them that learning takes time. 0-2 correct: Be very supportive and encouraging. Maximum 2 sentences. Be warm and friendly.'
    case 'sv': return 'Du är en vis mattelärare. Ge varierad och konstruktiv feedback baserat på prestation. 9-10 rätt: Fira deras mästerskap! 7-8 rätt: Beröm deras starka färdigheter. 5-6 rätt: Uppmuntra dem att fortsätta öva. 3-4 rätt: Påminn dem om att lärande tar tid. 0-2 rätt: Var mycket stöttande och uppmuntrande. Maximalt 2 meningar. Var varm och vänlig.'
    default: return 'Olet viisas matematiikanopettaja. Anna monipuolista ja rakentavaa palautetta suorituksen perusteella. 9-10 oikein: Juhli heidän osaamistaan! 7-8 oikein: Kehu heidän taitojaan. 5-6 oikein: Kannusta jatkamaan harjoittelua. 3-4 oikein: Muistuta, että oppiminen vie aikaa. 0-2 oikein: Ole hyvin tukeva ja kannustava. Maksimissaan 2 virkettä. Ole lämmin ja ystävällinen.'
  }
}
function userFeedback(stats: any, locale: Locale) {
  const { correct, total, avgMs, mistakes } = stats

  switch (locale) {
    case 'en': return `Student got ${correct} out of ${total} correct. Give feedback for this result.`
    case 'sv': return `Eleven fick ${correct} av ${total} rätt. Ge feedback för detta resultat.`
    default: return `Oppilas sai ${correct} / ${total} oikein. Anna palaute tälle tulokselle.`
  }
}

export async function aiHint(a: number, b: number, locale: Locale = 'fi', gameType: 'multiplication' | 'addition' = 'multiplication') {
  const c = createOpenAIClient()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: `${sysHint(locale, gameType)} ${userHint(a, b, locale, gameType)}` }],
    temperature: 0.4,
    max_tokens: 60,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}

export async function aiRoundFeedback(stats: { correct: number, total: number, avgMs: number, mistakes: Array<{ a: number, b: number }> }, locale: Locale = 'fi') {
  const c = createOpenAIClient()

  const systemMsg = sysFeedback(locale)
  const userMsg = userFeedback(stats, locale)

  console.log('AI Feedback Debug:')
  console.log('Stats:', stats)
  console.log('System:', systemMsg)
  console.log('User:', userMsg)

  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg }
    ],
    temperature: 0.5,
    max_tokens: 100,
    presence_penalty: 0.2
  })

  const result = r.choices?.[0]?.message?.content?.trim() ?? ''
  console.log('AI Response:', result)
  return result
}

function sysFinalFeedback(locale: Locale) {
  switch (locale) {
    case 'en': return 'You are a wise math teacher giving final game feedback. Respond based on percentage. 80%+: Celebrate mastery! 60-79%: Praise progress. 40-59%: Encourage effort. Under 40%: Supportive encouragement. Max 3 sentences. Be inspiring.'
    case 'sv': return 'Du är en vis mattelärare som ger slutlig spelåterkoppling. Svara baserat på procent. 80%+: Fira mästerskap! 60-79%: Beröm framsteg. 40-59%: Uppmuntra ansträngning. Under 40%: Stöttande uppmuntran. Max 3 meningar. Var inspirerande.'
    default: return 'Olet viisas matematiikanopettaja, joka antaa pelin loppupalautteen. Vastaa prosentin mukaan. 80%+: Juhli osaamista! 60-79%: Kehu edistystä. 40-59%: Kannusta yrittämään. Alle 40%: Tukaiseva kannustus. Max 3 virkettä. Ole inspiroiva.'
  }
}

function userFinalFeedback(stats: any, locale: Locale) {
  const total = stats.totalQuestions || stats.totalAnswered || 0
  const correct = stats.totalCorrect || 0
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  console.log('Final feedback debug:', { total, correct, percentage, stats })

  switch (locale) {
    case 'en': return `Student got ${percentage}% correct (${correct}/${total}). Give inspiring feedback.`
    case 'sv': return `Eleven fick ${percentage}% rätt (${correct}/${total}). Ge inspirerande feedback.`
    default: return `Oppilas sai ${percentage}% oikein (${correct}/${total}). Anna inspiroivaa palautetta.`
  }
}

export async function aiFinalFeedback(stats: any, locale: Locale = 'fi') {
  const c = createOpenAIClient()
  const r = await (c as any).chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: sysFinalFeedback(locale) },
      { role: 'user', content: userFinalFeedback(stats, locale) }
    ],
    temperature: 0.5,
    max_tokens: 150,
    presence_penalty: 0.2
  })
  return r.choices?.[0]?.message?.content?.trim() ?? ''
}
