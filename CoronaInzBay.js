// Hier den Index des Kreises auswählen.
// Siehe json output von https://europe-west3-brdata-corona.cloudfunctions.net/lglApi/date
let kreisId = 53

const widget = new ListWidget()
const kreisinzidenzdata = await fetchKreisInzidenzData()
await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {
    widget.setPadding(20, 10, 20, 10)
    let row = widget.addStack()
    row.layoutVertically()
    let col = row.addStack()
    col.layoutHorizontally()
    col.addSpacer()
    const inzText = row.addText(kreisinzidenzdata.name)
    inzText.font = Font.mediumRoundedSystemFont(20)
    col.addSpacer()
    widget.addSpacer()
    let row2 = widget.addStack()
    row2.layoutHorizontally()
    row2.addSpacer()
    let col1 = row2.addStack()
    col1.layoutVertically()
    col1.addSpacer()
    let counter = kreisinzidenzdata.inzidenz;
    const inz = col1.addText(counter.toString())
    inz.font = Font.mediumRoundedSystemFont(35)
    inz.centerAlignText()
    if (counter < 50) {
        inz.textColor = new Color("#008000")
    } else {
       if (counter < 200) {
          inz.textColor = new Color("#FFFF00")
        } else {
            inz.textColor = new Color("FF0000") 
    }}
    col1.addSpacer()
    row2.addSpacer()
    let col2 = row2.addStack()
    col2.layoutVertically()
    col2.addSpacer()
    const deltacases = col2.addText(kreisinzidenzdata.deltacases.toString())
    const deltadeaths = col2.addText(kreisinzidenzdata.deltadeaths.toString())
    col2.addSpacer()
    deltacases.font = Font.mediumRoundedSystemFont(12)
    deltadeaths.font = Font.mediumRoundedSystemFont(12)
    row2.addSpacer()
    widget.addSpacer()
    let row3 = widget.addStack()
    row3.layoutHorizontally()
    row3.addSpacer()
    const dateTxt = row3.addText(kreisinzidenzdata.datestr)
    row3.addSpacer()
}

// fetch incidence data from br-data
// see: https://github.com/br-data/corona-bayern-api
async function fetchKreisInzidenzData() {
    let url
    let counter = 0
    let name = 'unbekannt'
    let datestr = ""
    let deltacases = -1
    let deltadeaths = -1
    url = 'https://europe-west3-brdata-corona.cloudfunctions.net/lglApi/date'
    let req = new Request(url)
    let apiResult = await req.loadJSON()
    if (req.response.statusCode == 200) {
      inzidenz = apiResult[kreisId]['cases-per-100tsd-7days']
      name = apiResult[kreisId]['name']
      deltacases = apiResult[kreisId]['cases'] - apiResult[kreisId]['previous-cases']
      deltadeaths = apiResult[kreisId]['deaths'] - apiResult[kreisId]['previous-deaths']
      date = new Date(apiResult[kreisId]['last-updated'])
      if (date.getDate() < 10) {
        datestr = "0"
      } 
      datestr += date.getDate().toString()+"."
      if (date.getMonth() < 9) {
        datestr += "0"
      } 
      datestr += (date.getMonth()+1).toString()+". "
      if (date.getHours() < 10) {
        datestr += "0"
      }
      datestr += date.getHours().toString()+":"
      if (date.getMinutes() < 10) {
        datestr += "0"
      }
      datestr += date.getMinutes().toString()
    }
    return {inzidenz, name, deltacases, deltadeaths, datestr}
}
