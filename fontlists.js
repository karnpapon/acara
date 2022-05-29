const fs = require("fs")
const path = require("path")

const list = { data: []}

fs.readdirSync(path.join(__dirname, "fonts")).forEach(file => {
  const f = file.split(".").shift()
  list.data.push(f)
  fs.writeFileSync(path.join(__dirname, "fontlists.json"), JSON.stringify(list))
})