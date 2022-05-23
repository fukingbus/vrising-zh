//
const projectId = "translate-cf9a4"
const RAW_FILE = 'SChinese.json'
const TRANSLATED_FILE = 'SChinese.json'

//
const keys = require('./keys.json');
const fs = require('fs')
const cliProgress = require('cli-progress');
//
const {Translate} = require('@google-cloud/translate').v2
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const translate = new Translate({projectId,credentials: keys})

async function quickStart() {
    if(!fs.existsSync('./input'))
        fs.mkdirSync('./input')
        
    if(!fs.existsSync('./output'))
        fs.mkdirSync('./output')

    let raw = JSON.parse(fs.readFileSync(`./input/${RAW_FILE}`))
    let translated = JSON.parse(fs.readFileSync(`./input/${TRANSLATED_FILE}`))
    if(raw.Nodes.length != translated.Nodes.length){
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
        fs.writeFileSync(`./output/${TRANSLATED_FILE}`,JSON.stringify(tmpTranslated,null,4))
        progressBar.stop()
    }
    else{
        console.log('[SYS] Terminated (same length)')
    }
  }
  
  quickStart();