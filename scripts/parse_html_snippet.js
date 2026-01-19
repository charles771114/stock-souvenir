import fs from 'fs'
import path from 'path'

const htmlPath = path.resolve(process.cwd(), 'scripts/raw_2025_snippet.html')
const htmlContent = fs.readFileSync(htmlPath, 'utf8')

// Regex Patterns
const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs
const codeRegex = /<span class="stock-code">\s*(\d+)\s*<\/span>/
const nameRegex = /<span class="stock-name">\s*([^<]+)\s*<\/span>/
const souvenirRegex = /c-model="souvenirs">\s*([^<]+)\s*<\/td>/
const dateLinkRegex = /href="[^"]+date=(\d+)"/
const lastBuyRegex = /c-model="latestBuyDateFormat">\s*(\d{2}\/\d{2})\s*<\/td>/

const parsedData = []
let match
while ((match = rowRegex.exec(htmlContent)) !== null) {
    const rowHtml = match[1]

    const codeMatch = rowHtml.match(codeRegex)
    const nameMatch = rowHtml.match(nameRegex)
    const souvenirMatch = rowHtml.match(souvenirRegex)
    const dateLinkMatch = rowHtml.match(dateLinkRegex)
    const lastBuyMatch = rowHtml.match(lastBuyRegex)

    if (codeMatch && nameMatch && souvenirMatch) {
        const code = codeMatch[1].trim()
        const name = nameMatch[1].trim()
        const souvenir_item = souvenirMatch[1].trim()

        let meeting_date = ''
        if (dateLinkMatch) {
            const timestamp = parseInt(dateLinkMatch[1])
            // Check if timestamp is valid
            const date = new Date(timestamp)
            if (!isNaN(date.getTime())) {
                meeting_date = date.toISOString().split('T')[0]
            }
        }

        let last_buy_date = null
        if (lastBuyMatch) {
            const [m, d] = lastBuyMatch[1].trim().split('/')
            const meetingYear = meeting_date ? meeting_date.split('-')[0] : '2025'
            last_buy_date = `${meetingYear}-${m}-${d}`
        }

        parsedData.push({
            code,
            name,
            souvenir_item,
            meeting_date,
            last_buy_date
        })
    }
}

// Remove duplicates based on code if any
const uniqueData = parsedData.filter((v, i, a) => a.findIndex(t => (t.code === v.code)) === i)

console.log(`Parsed ${uniqueData.length} items.`)
fs.writeFileSync(
    path.resolve(process.cwd(), 'scripts/mock_2025_data.json'),
    JSON.stringify(uniqueData, null, 2)
)
