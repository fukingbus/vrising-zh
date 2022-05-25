//
const projectId = "translate-cf9a4"
const RAW_FILE = 'SChinese.json'
const TRANSLATED_FILE = 'SChinese.json'
const REPLACE_DICT = 'dict.json'

//
const fs = require('fs')
const keys = require('./keys.json');
const cliProgress = require('cli-progress');
//
const replacementDict = JSON.parse(fs.readFileSync(`./${REPLACE_DICT}`))
//
const {Translate} = require('@google-cloud/translate').v2
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const translate = new Translate({projectId,credentials: keys})
//

async function entry() {
    if(!fs.existsSync('./input'))
        fs.mkdirSync('./input')
        
    if(!fs.existsSync('./output'))
        fs.mkdirSync('./output')

    const raw = JSON.parse(fs.readFileSync(`./input/${RAW_FILE}`))
    const translated = fs.existsSync(`./output/${TRANSLATED_FILE}`) ? JSON.parse(fs.readFileSync(`./output/${TRANSLATED_FILE}`)) : null

    if(translated == null || raw.Nodes.length != translated.Nodes.length){
        console.log('[SYS] Begin Translation ')
        await doTranslate(raw)
    }
    console.log('[SYS] Begin Replacement')
    if(translated != null)
        await doReplace()
    else
        console.log('[SYS] Translated file missing')
  }

  async function doTranslate(raw){
    let tmpTranslated = raw

    progressBar.start(raw.Nodes.length,0)

    for (let index = 0; index < raw.Nodes.length; index++) {
        const rawText = raw.Nodes[index].Text;
        const translatedText = (await translate.translate(rawText, {
            from: 'zh-CN',
            to: 'zh-TW'
        }))[0];
        tmpTranslated.Nodes[index].Text = translatedText
        progressBar.increment()
    }
    progressBar.stop()
    await output(tmpTranslated,`./output/${TRANSLATED_FILE}`)
    return tmpTranslated
  }

  async function doReplace(){
    const translated = JSON.parse(fs.readFileSync(`./output/${TRANSLATED_FILE}`))
    let tmpTranslated = translated

    progressBar.start(tmpTranslated.Nodes.length,0)

    for (let index = 0; index < tmpTranslated.Nodes.length; index++) {
        for (let searchIndex = 0; searchIndex < replacementDict.entries.length; searchIndex++) {
            const searchEntry = replacementDict.entries[searchIndex];
            tmpTranslated.Nodes[index].Text = tmpTranslated.Nodes[index].Text.replace(new RegExp(searchEntry,'g'), replacementDict.replacement[searchIndex])
        }

        progressBar.increment()
    }
    progressBar.stop()
    output(tmpTranslated,`./output/${TRANSLATED_FILE}`)
  }

  async function output(payload,path){
    await fs.writeFileSync(path,JSON.stringify(payload,null,4))
  }
  
  entry()