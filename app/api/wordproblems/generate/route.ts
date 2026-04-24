import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const REQUEST_TIMEOUT_MS = 10000
const hasOpenAI = !!process.env.OPENAI_API_KEY
const hasAzure = !!process.env.AZURE_OPENAI_API_KEY
const hasAIProvider = hasOpenAI || hasAzure

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

// Use GPT-4o-mini for better instruction following and less hallucination
const MODEL = hasOpenAI ? 'gpt-4o-mini' : (process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini')

type Locale = 'fi' | 'en' | 'sv'
type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division'

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRangeMax(operation: Operation, range: string): number {
  if (operation === 'multiplication') {
    if (range.includes('veryhard')) return 25
    return range.includes('12') ? 12 : 10
  }
  if (operation === 'division') {
    if (range.includes('veryhard')) return 25
    if (range.includes('12')) return 12
    if (range.includes('10')) return 10
    return 5
  }
  if (range.includes('veryhard')) return 200
  if (range.includes('100')) return 100
  if (range.includes('50')) return 50
  if (range.includes('20')) return 20
  return 10
}

function getFallbackWordProblem(locale: Locale, operation: Operation, range: string) {
  const max = getRangeMax(operation, range)
  let a = 0
  let b = 0
  let symbol = '+'
  let answer = 0

  if (operation === 'subtraction') {
    a = randomInt(2, max)
    b = randomInt(1, a - 1)
    symbol = '-'
    answer = a - b
  } else if (operation === 'multiplication') {
    a = randomInt(2, max)
    b = randomInt(2, max)
    symbol = '×'
    answer = a * b
  } else if (operation === 'division') {
    b = randomInt(2, max)
    const multiplier = randomInt(2, max)
    a = b * multiplier
    symbol = '÷'
    answer = a / b
  } else {
    a = randomInt(1, max)
    b = randomInt(1, max)
    symbol = '+'
    answer = a + b
  }

  if (locale === 'en') {
    const problem = operation === 'addition'
      ? `Emma has ${a} stickers and gets ${b} more. How many stickers does Emma have now?`
      : operation === 'subtraction'
        ? `Tom has ${a} apples and gives ${b} away. How many apples are left?`
        : operation === 'multiplication'
          ? `There are ${a} boxes with ${b} pencils in each. How many pencils are there altogether?`
          : `${a} cookies are shared equally among ${b} children. How many cookies does each child get?`
    return { problem, equation: `${a} ${symbol} ${b}`, answer }
  }

  if (locale === 'sv') {
    const problem = operation === 'addition'
      ? `Lisa har ${a} klistermärken och får ${b} till. Hur många klistermärken har Lisa nu?`
      : operation === 'subtraction'
        ? `Erik har ${a} äpplen och ger bort ${b}. Hur många äpplen är kvar?`
        : operation === 'multiplication'
          ? `Det finns ${a} lådor med ${b} pennor i varje. Hur många pennor finns det totalt?`
          : `${a} kakor delas lika mellan ${b} barn. Hur många kakor får varje barn?`
    return { problem, equation: `${a} ${symbol} ${b}`, answer }
  }

  const problem = operation === 'addition'
    ? `Ainolla on ${a} tarraa ja hän saa ${b} lisää. Kuinka monta tarraa Ainolla on nyt?`
    : operation === 'subtraction'
      ? `Matilla on ${a} omenaa ja hän antaa ${b} pois. Kuinka monta omenaa jää?`
      : operation === 'multiplication'
        ? `On ${a} laatikkoa, ja jokaisessa on ${b} kynää. Kuinka monta kynää on yhteensä?`
        : `${a} keksiä jaetaan tasan ${b} lapselle. Kuinka monta keksiä jokainen lapsi saa?`
  return { problem, equation: `${a} ${symbol} ${b}`, answer }
}

function getSystemPrompt(locale: Locale, operation: Operation): string {
  const operationSymbols = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷'
  }

  const symbol = operationSymbols[operation]

  if (locale === 'en') {
    const divisionNote = operation === 'division' ? '\n- CRITICAL: Division MUST result in whole numbers with NO remainder. Choose numbers carefully so they divide evenly.' : ''

    return `You are a creative math teacher creating word problems IN ENGLISH for children (ages 7-10).

CRITICAL: Respond ONLY in ENGLISH. Do not use Finnish, Swedish, or any other language.

Create a ${operation} word problem that is:
- Simple and relatable
- Age-appropriate language
- Clear and unambiguous
- Use ENGLISH NAMES like Emma, Jake, Lisa, Tom, Sarah, Ben, Amy, Max
- Results in whole numbers only${divisionNote}

CRITICAL - OPERATION TYPE:
${operation === 'addition' ? '- Problem MUST be ADDITION (+). Do NOT create multiplication, subtraction, or division!\n- Example CORRECT: "Tom has 5 balls. He gets 3 more balls."\n- Example WRONG: "Tom has 5 boxes with 3 balls each" (THIS IS MULTIPLICATION!)' :
        operation === 'subtraction' ? '- Problem MUST be SUBTRACTION (−). Do NOT create addition, multiplication, or division!\n- Example CORRECT: "Lisa has 8 candies. She eats 3 candies."\n- Example WRONG: "Lisa has 8 candies. She gets 3 more" (THIS IS ADDITION!)' :
          operation === 'multiplication' ? '- Problem MUST be MULTIPLICATION (×). Do NOT create addition, subtraction, or division!\n- Example CORRECT: "Emma has 4 boxes. Each box has 3 balls."\n- Example WRONG: "Emma has 4 balls. She gets 3 more" (THIS IS ADDITION!)' :
            '- Problem MUST be DIVISION (÷). Do NOT create addition, subtraction, or multiplication!\n- Example CORRECT: "Ben has 12 candies. He gives them all to his 3 friends to share equally."\n- Example WRONG: "Ben has 12 candies and 3 friends total" (NOT DIVISION!)'}\n\nCRITICAL FOR SHARING PROBLEMS: \n- Explicitly state "how many does EACH FRIEND get" or "how many does EACH PERSON get" only if it is CLEAR who the people are.\n- Avoid ambiguity about whether the sharer is included. E.g., "Shares with 3 friends" -> 3 people total receiving items.

BE CREATIVE AND VARIED! Don't repeat same words or situations. Use different:

CONTEXTS:
- Food: apples, bananas, candies, cookies, pizza slices, ice creams, muffins, donuts
- Sports: soccer balls, tennis balls, golf balls, frisbees, skates, bats
- Animals: birds, rabbits, cats, dogs, hamsters, fish, horses, sheep
- Nature: flowers, trees, rocks, shells, leaves, pinecones, berries
- School: pencils, erasers, markers, chalk, notebooks, books, scissors
- Toys: cars, dolls, blocks, puzzles, action figures, dinosaurs
- Travel: buses, taxis, bikes, boats, trains
- Daily life: plates, cups, spoons, pillows, blankets, socks

VERBS AND SITUATIONS:
- gets, finds, buys, collects, wins (addition)
- gives away, eats, loses, donates, sells (subtraction)
- shares equally, divides into groups, sorts into boxes (division)
- per person, each, per row, per day (multiplication)

CRITICAL: Use EXACTLY these keywords (PROBLEM, EQUATION, ANSWER):

PROBLEM: [the word problem IN ENGLISH - be creative!]
EQUATION: [number ${symbol} number]
ANSWER: [correct answer as integer]

GOOD EXAMPLES of varied problems:
PROBLEM: Amy plays in the park and finds 3 pinecones. Her sister finds 5 pinecones. How many pinecones did they find together?
PROBLEM: Ben's bookshelf has 8 comic books. He lends 3 books to a friend. How many books are left on the shelf?
PROBLEM: Sarah bakes muffins. She puts 4 blueberries in each muffin. If she bakes 5 muffins, how many blueberries does she need?`
  }

  if (locale === 'sv') {
    const divisionNote = operation === 'division' ? '\n- VIKTIGT: Divisionen MÅSTE gå jämnt ut (ingen rest). Välj tal noggrant så att de går jämnt upp.' : ''

    return `Du är en kreativ mattelärare som skapar textproblem PÅ SVENSKA för barn (7-10 år).

KRITISKT: Svara ENDAST på SVENSKA. Använd inte engelska, finska eller något annat språk.

Skapa ett ${operation === 'addition' ? 'additions' : operation === 'subtraction' ? 'subtraktions' : operation === 'multiplication' ? 'multiplikations' : 'divisions'}problem som är:
- Enkelt och relaterbart
- Åldersenligt språk
- Tydligt och entydigt
- Använd SVENSKA NAMN som Lisa, Erik, Anna, Johan, Maja, Olle, Karin, Gustav
- Resulterar endast i hela tal${divisionNote}

KRITISKT - RÄKNESÄTT:
${operation === 'addition' ? '- Problemet MÅSTE vara ADDITION (+). Skapa INTE multiplikation!\n- KORREKT: "Erik har 5 bollar. Han får 3 bollar till."\n- FEL: "Erik har 5 lådor med 3 bollar i varje" (MULTIPLIKATION!)' :
        operation === 'subtraction' ? '- Problemet MÅSTE vara SUBTRAKTION (−). Skapa INTE addition!\n- KORREKT: "Anna har 8 godisar. Hon äter 3 godisar."\n- FEL: "Anna har 8 godisar. Hon får 3 till" (ADDITION!)' :
          operation === 'multiplication' ? '- Problemet MÅSTE vara MULTIPLIKATION (×). Skapa INTE addition!\n- KORREKT: "Lisa har 4 lådor. Varje låda har 3 bollar."\n- FEL: "Lisa har 4 bollar. Hon får 3 till" (ADDITION!)' :
            '- Problemet MÅSTE vara DIVISION (÷). Dela lika!\n- KORREKT: "Johan har 12 godisar. Han ger bort alla till sina 3 vänner att dela lika."\n- FEL: "Johan har 12 godisar och 3 vänner" (INTE DIVISION!)'}\n\nKRITISKT FÖR DELNINGSPROBLEM:\n- Var tydlig med vem som får sakerna. "Hur många får VARJE VÄN?" är bättre än "varje person".\n- Undvik oklarhet om den som delar är inkluderad. T.ex. "Delar med 3 vänner" -> 3 personer får saker.

VAR KREATIV OCH VARIERANDE! Upprepa inte samma ord eller situationer. Använd olika:

KONTEXT:
- Mat: äpplen, bananer, godis, kakor, pizzabitar, glass, muffins, munkar
- Sport: fotbollar, tennisbollar, golfbollar, frisbees, skridskor, klubbor
- Djur: fåglar, kaniner, katter, hundar, hamstrar, fiskar, hästar, får
- Natur: blommor, träd, stenar, snor, löv, kottar, bär
- Skola: pennor, suddgummin, markers, krita, anteckningsböcker, böcker, saxar
- Leksaker: bilar, dockor, klossar, pussel, actionfigurer, dinosaurier
- Resor: bussar, taxibilar, cyklar, båtar, tåg
- Vardagsliv: tallrikar, koppar, skedar, kuddar, filtar, strumpor

VERB OCH SITUATIONER:
- får, hittar, köper, samlar, vinner (addition)
- ger bort, äter, förlorar, donerar, säljer (subtraktion)
- delar lika, delar i grupper, sorterar i lådor (division)
- per person, varje, per rad, per dag (multiplikation)

KRITISKT: Använd EXAKT dessa engelska nyckelord (PROBLEM, EQUATION, ANSWER), även om problemet är på svenska:

PROBLEM: [textproblemet PÅ SVENSKA - var kreativ!]
EQUATION: [tal ${symbol} tal]
ANSWER: [korrekt svar som heltal]

BRA EXEMPEL på varierade problem:
PROBLEM: Anna leker i parken och hittar 3 kottar. Hennes syster hittar 5 kottar. Hur många kottar hittade de tillsammans?
PROBLEM: Johans bokhylla har 8 serietidningar. Han lånar ut 3 tidningar till en kompis. Hur många tidningar finns kvar i hyllan?
PROBLEM: Lisa bakar muffins. Hon lägger 4 blåbär i varje muffin. Om hon bakar 5 muffins, hur många blåbär behöver hon?`
  }

  // Finnish (default)
  const divisionNote = operation === 'division' ? '\n- TÄRKEÄÄ: Jakolasku TÄYTYY mennä tasan (ei jakojäännöstä). Valitse jaettava huolellisesti niin että se menee tasan jakajalla.' : ''

  return `Olet luova matematiikanopettaja, joka luo sanallisia tehtäviä SUOMEKSI lapsille (7-10 v). 

KRITTISEN TÄRKEÄÄ: Vastaa VAIN ja AINOASTAAN SUOMEN KIELELLÄ. Älä käytä englantia, ruotsia tai mitään muuta kieltä.

Luo ${operation === 'addition' ? 'yhteenlasku' : operation === 'subtraction' ? 'vähennyslasku' : operation === 'multiplication' ? 'kertolasku' : 'jakolasku'}tehtävä, joka on:
- Yksinkertainen ja helposti ymmärrettävä
- Ikätasolle sopiva kieli
- Selkeä ja yksiselitteinen
- Käytä SUOMALAISIA NIMIÄ kuten Liisa, Matti, Emma, Ville, Aino, Jussi, Kati, Pekka
- Tuottaa vain kokonaislukuvastauksia${divisionNote}

KRITTISEN TÄRKEÄÄ - LASKUTOIMITUS:
${operation === 'addition' ? '- Tehtävä TÄYTYY olla YHTEENLASKU (+). ÄLÄ tee kertolaskua!\n- OIKEIN: "Matilla on 5 palloa. Hän saa 3 palloa lisää."\n- VÄÄRIN: "Matilla on 5 laatikkoa ja jokaisessa 3 palloa" (KERTOLASKU!)' :
      operation === 'subtraction' ? '- Tehtävä TÄYTYY olla VÄHENNYSLASKU (−). ÄLÄ tee yhteenlaskua!\n- OIKEIN: "Liisalla on 8 karkkia. Hän syö 3 karkkia."\n- VÄÄRIN: "Liisalla on 8 karkkia. Hän saa 3 lisää" (YHTEENLASKU!)' :
        operation === 'multiplication' ? '- Tehtävä TÄYTYY olla KERTOLASKU (×). ÄLÄ tee yhteenlaskua!\n- OIKEIN: "Emmalla on 4 laatikkoa. Jokaisessa laatikossa on 3 palloa."\n- VÄÄRIN: "Emmalla on 4 palloa. Hän saa 3 lisää" (YHTEENLASKU!)' :
          '- Tehtävä TÄYTYY olla JAKOLASKU (÷). Jaa tasan!\n- OIKEIN: "Pekalla on 12 karkkia. Hän antaa ne kaikki 3 ystävälleen jaettavaksi tasan."\n- VÄÄRIN: "Pekalla on 12 karkkia ja 3 kaveria" (EI JAKOLASKUA!)'}\n\nTÄRKEÄÄ JAKOLASKUISSA:\n- Ole selkeä kuka saa tavarat. "Montako karkkia KUKIN YSTÄVÄ saa?" on selkeämpi kuin "jokainen henkilö".\n- Vältä epäselvyyttä siitä, onko jakaja mukana. "Jakaa 3 ystävän kesken" -> 3 henkilöä saa tavaroita.

OLE LUOVA JA VAIHTELEVA! Älä toista samoja sanoja tai tilanteita. Käytä erilaisia:

KONTEKSTEJA:
- Ruoka: omenat, banaanit, karkit, keksit, pizzapalat, jäätelöt, leivät, muffinsit
- Harrastukset: jalkapallot, tennispallot, golfpallot, frisbet, luistimet, mailat
- Eläimet: linnut, kanit, kissat, koirat, hamsterit, kalat, hevoset, lampaat
- Luonto: kukat, puut, kivet, simpukat, lehdet, kävyt, marjat
- Koulu: kyniä, kumeja, tusseja, liidut, vihkoja, kirjoja, sakset
- Leikit: autot, nuket, palikat, palapelit, leluhahmo, dinosaurukset
- Matka: bussit, taksit, polkupyörät, laivat, junat
- Arki: lautaset, mukit, lusikat, tyynyt, viltti, sukat

VERBEJÄ JA TILANTEITA:
- saa, löytää, ostaa, kerää, voittaa (yhteenlasku)
- antaa pois, syö, menettää, lahjoittaa, myy (vähennys)
- jakaa tasan, jakaa ryhmään, lajitella laatikoihin (jako)
- per henkilö, jokaiselle, joka riviä, per päivä (kertolasku)

KRITTISEN TÄRKEÄÄ: Käytä TÄSMÄLLEEN näitä englanninkielisiä avainsanoja (PROBLEM, EQUATION, ANSWER), vaikka tehtävä on suomeksi:

PROBLEM: [sanallinen tehtävä SUOMEKSI - ole luova!]
EQUATION: [luku ${symbol} luku]
ANSWER: [oikea vastaus kokonaislukuna]

HYVIÄ ESIMERKKEJÄ vaihtelevista tehtävistä:
PROBLEM: Aino leikkii puistossa ja löytää 3 käpyä. Hänen siskonsä löytää 5 käpyä. Montako käpyä he löysivät yhteensä?
PROBLEM: Jussin kirjahyllyllä on 8 sarjakuvalehteä. Hän lainaa 3 lehteä kaverille. Montako lehteä jää hyllyyn?
PROBLEM: Liisa leipoo muffinsseja. Hän laittaa 4 mustikoita jokaiseen muffinssiin. Jos hän leipoo 5 muffinsia, montako mustikoita hän tarvitsee?`
}

function getUserPrompt(operation: Operation, range: string): string {
  // Determine number range based on operation and difficulty
  let minNum = 1
  let maxNum = 20

  if (operation === 'multiplication') {
    minNum = 2
    if (range.includes('veryhard')) {
      maxNum = 25  // Very hard: up to 25 for challenging mental math
    } else {
      maxNum = range.includes('12') ? 12 : 10
    }
    return `Create a ${operation} word problem using numbers between ${minNum} and ${maxNum}. Make it engaging and appropriate for children.`
  } else if (operation === 'division') {
    minNum = 2
    if (range.includes('veryhard')) {
      maxNum = 25  // Very hard: up to 25, still doable for kids
    } else {
      maxNum = range.includes('12') ? 12 : range.includes('10') ? 10 : 5
    }
    return `Create a ${operation} word problem using numbers between ${minNum} and ${maxNum}. CRITICAL: The division MUST result in a whole number (no remainders). Choose the dividend carefully so it divides evenly by the divisor. Example: 12 ÷ 3 = 4 (correct), NOT 10 ÷ 3 (incorrect - has remainder). Make it engaging and appropriate for children.`
  } else if (operation === 'addition' || operation === 'subtraction') {
    if (range.includes('veryhard')) {
      maxNum = 200  // Very hard: larger numbers for challenging mental math, but still reasonable
    } else if (range.includes('100')) {
      maxNum = 100
    } else if (range.includes('50')) {
      maxNum = 50
    } else if (range.includes('20')) {
      maxNum = 20
    } else {
      maxNum = 10
    }
    return `Create a ${operation} word problem using numbers between ${minNum} and ${maxNum}. Make it engaging and appropriate for children.`
  }

  return `Create a ${operation} word problem using numbers between ${minNum} and ${maxNum}. Make it engaging and appropriate for children.`
}

function parseAIResponse(response: string): { problem: string; equation: string; answer: number } | null {
  try {
    const problemMatch = response.match(/PROBLEM:\s*(.+?)(?=EQUATION:|$)/s)
    const equationMatch = response.match(/EQUATION:\s*(.+?)(?=ANSWER:|$)/s)
    const answerMatch = response.match(/ANSWER:\s*(\d+)/s)

    if (!problemMatch || !equationMatch || !answerMatch) {
      console.error('Failed to parse AI response:', response)
      return null
    }

    const problem = problemMatch[1].trim()
    let equation = equationMatch[1].trim()

    // Normalize equation symbols
    equation = equation.replace(/−/g, '-')  // Replace MINUS SIGN (U+2212) with hyphen-minus
    equation = equation.replace(/×/g, '*')  // Replace multiplication sign
    equation = equation.replace(/÷/g, '/')  // Replace division sign
    equation = equation.replace(/\//g, '÷') // Standardize division to ÷

    const answer = parseInt(answerMatch[1].trim())

    if (!problem || !equation || isNaN(answer)) {
      console.error('Invalid parsed values:', { problem, equation, answer })
      return null
    }

    // Validate the equation matches the answer
    try {
      const equationParts = equation.match(/(\d+)\s*([\+\-\*×÷\/])\s*(\d+)/)
      if (equationParts) {
        const num1 = parseInt(equationParts[1])
        const operator = equationParts[2]
        const num2 = parseInt(equationParts[3])

        let calculatedAnswer: number
        switch (operator) {
          case '+': calculatedAnswer = num1 + num2; break
          case '-': case '−': calculatedAnswer = num1 - num2; break
          case '*': case '×': calculatedAnswer = num1 * num2; break
          case '/': case '÷': calculatedAnswer = num1 / num2; break
          default: calculatedAnswer = answer
        }

        if (calculatedAnswer !== answer) {
          return null
        }

        // Check for division remainders
        if ((operator === '/' || operator === '÷') && num1 % num2 !== 0) {
          return null
        }
      }
    } catch (error) {
      // Validation failed, continue
    }

    return { problem, equation, answer }
  } catch (error) {
    console.error('Error parsing AI response:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  let locale: Locale = 'fi'
  let operation: Operation = 'addition'
  let range = '1-20-add'

  try {
    const body = await request.json()
    locale = (body.locale || 'fi') as Locale
    operation = (body.operation || 'addition') as Operation
    range = body.range || '1-20-add'

    if (!hasAIProvider) {
      return NextResponse.json(getFallbackWordProblem(locale, operation, range))
    }

    const client = createOpenAIClient()
    const systemPrompt = getSystemPrompt(locale, operation)
    const userPrompt = getUserPrompt(operation, range)

    // Retry logic for incomplete responses
    let attempts = 0
    const maxAttempts = 3
    let parsed = null

    while (attempts < maxAttempts && !parsed) {
      attempts++

      const response = await (client as any).chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      })

      const aiText = response.choices?.[0]?.message?.content?.trim()
      if (!aiText) {
        continue
      }

      // Check if response seems complete (has all three parts)
      const hasAllParts = aiText.includes('PROBLEM:') && aiText.includes('EQUATION:') && aiText.includes('ANSWER:')
      if (!hasAllParts) {
        continue
      }

      parsed = parseAIResponse(aiText)
    }

    if (parsed) {
      return NextResponse.json(parsed)
    }

    return NextResponse.json(getFallbackWordProblem(locale, operation, range))
  } catch (error) {
    console.error('Error generating word problem:', error)
    return NextResponse.json(getFallbackWordProblem(locale, operation, range))
  }
}
